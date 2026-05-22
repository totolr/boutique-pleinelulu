/*
 * admin-stock : API du dashboard /admin pour la gestion du stock.
 *   GET   /api/admin-stock        liste les lignes de stock
 *   PATCH /api/admin-stock?id=N   { quantity } met à jour une quantité
 *
 * Auth identique à admin-orders (JWT Supabase + whitelist ADMIN_EMAILS).
 * L'écriture passe par la clé service_role : les RLS n'autorisent que le SELECT
 * pour la clé anon du navigateur.
 */

import { createClient } from "@supabase/supabase-js";
import { authenticate } from "./_admin-auth.js";

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handler(event) {
  const auth = await authenticate(event, supabaseAdmin);
  if (auth.error) return json(auth.error.status, { error: auth.error.message });
  const user = auth.user;

  // GET : liste du stock
  if (event.httpMethod === "GET") {
    const { data, error } = await supabaseAdmin
      .from("stock")
      .select("id, product_id, color, size, quantity, updated_at")
      .order("product_id", { ascending: true })
      .order("color", { ascending: true })
      .order("size", { ascending: true });

    if (error) {
      console.error("[admin-stock] list error:", error.message);
      return json(500, { error: error.message });
    }
    return json(200, { stock: data });
  }

  // PATCH : mise à jour d'une quantité
  if (event.httpMethod === "PATCH") {
    const id = event.queryStringParameters?.id;
    if (!id) return json(400, { error: "id manquant" });

    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { error: "body JSON invalide" });
    }

    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity < 0) {
      return json(400, { error: "quantity doit être un entier >= 0" });
    }

    const { data, error } = await supabaseAdmin
      .from("stock")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[admin-stock] update error:", error.message);
      return json(500, { error: error.message });
    }
    console.log(`[admin-stock] ${user.email} a mis ${data.product_id}/${data.color}/${data.size} à ${quantity}`);
    return json(200, { row: data });
  }

  return json(405, { error: "Method Not Allowed" });
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
