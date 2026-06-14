/*
 * admin-orders : API du dashboard /admin (bénévoles non techniques).
 *   GET   /api/admin-orders        liste toutes les commandes
 *   PATCH /api/admin-orders?id=N   { status, tracking_number, notes }
 *
 * Auth (en-tête Authorization: Bearer <jwt>) : l'utilisateur doit avoir une
 * session Supabase valide (token signé) et un email présent dans ADMIN_EMAILS.
 */

import { createClient } from "@supabase/supabase-js";
import { sendShippedEmail, sendPickupReadyEmail } from "./_email.js";
import { authenticate } from "./_admin-auth.js";

// Client service_role pour les opérations DB (bypass RLS).
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ALLOWED_STATUS = ["paid", "preparing", "shipped", "delivered", "cancelled"];

export async function handler(event) {
  const auth = await authenticate(event, supabaseAdmin);
  if (auth.error) return json(auth.error.status, { error: auth.error.message });
  const user = auth.user;

  // GET : liste
  if (event.httpMethod === "GET") {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, stripe_session_id, stripe_payment_intent, customer_email, customer_name, amount_total, items, status, shipping_method, shipping_address, billing_address, tracking_number, shipped_email_sent_at, notes, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[admin] list error:", error.message);
      return json(500, { error: error.message });
    }
    return json(200, { orders: data, me: user.email });
  }

  // PATCH : mise à jour
  if (event.httpMethod === "PATCH") {
    const id = event.queryStringParameters?.id;
    if (!id) return json(400, { error: "id manquant" });

    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { error: "body JSON invalide" });
    }

    const resend = body.resendShippingEmail === true;

    const patch = {};
    if (body.status !== undefined) {
      if (!ALLOWED_STATUS.includes(body.status)) {
        return json(400, { error: `status doit être l'un de ${ALLOWED_STATUS.join(", ")}` });
      }
      patch.status = body.status;
    }
    if (body.tracking_number !== undefined) patch.tracking_number = body.tracking_number || null;
    if (body.notes !== undefined) patch.notes = body.notes || null;

    if (Object.keys(patch).length === 0 && !resend) {
      return json(400, { error: "rien à mettre à jour" });
    }

    // Applique le patch s'il y en a un, sinon on récupère la commande (cas renvoi de mail seul).
    let data;
    if (Object.keys(patch).length > 0) {
      patch.updated_at = new Date().toISOString();
      const { data: updated, error } = await supabaseAdmin
        .from("orders")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        console.error("[admin] update error:", error.message);
        return json(500, { error: error.message });
      }
      data = updated;
      console.log(`[admin] ${user.email} a modifié commande ${data.order_number || id}:`, patch);
    } else {
      const { data: fetched, error } = await supabaseAdmin
        .from("orders")
        .select()
        .eq("id", id)
        .single();
      if (error || !fetched) {
        return json(404, { error: "commande introuvable" });
      }
      data = fetched;
    }

    // Mail d'expédition / retrait :
    //  - auto au passage en "shipped", une seule fois (garde-fou shipped_email_sent_at)
    //  - ou forcé manuellement via le bouton "renvoyer le mail" (resend), qui ignore le garde-fou
    let email = null;
    const autoSend = data.status === "shipped" && !data.shipped_email_sent_at;
    if (resend || autoSend) {
      email = await maybeSendShippingEmail(data);
      if (email?.sent) {
        const { data: marked } = await supabaseAdmin
          .from("orders")
          .update({ shipped_email_sent_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single();
        if (marked) Object.assign(data, marked);
      }
      if (resend) {
        console.log(`[admin] ${user.email} a renvoyé le mail commande ${data.order_number || id}`);
      }
    }

    return json(200, { order: data, email });
  }

  return json(405, { error: "Method Not Allowed" });
}

// Décide et envoie le bon mail selon le mode de livraison.
// - pickup            : mail "prête à retirer" (RDV Instagram)
// - delivery + suivi  : mail d'expédition avec lien La Poste
// - delivery sans suivi: rien, on remonte un avertissement à l'admin
async function maybeSendShippingEmail(order) {
  const firstName = (order.customer_name || "").trim().split(" ")[0] || "";
  const common = { to: order.customer_email, firstName, orderNumber: order.order_number };

  if (order.shipping_method === "pickup") {
    const res = await sendPickupReadyEmail(common);
    return res.ok ? { sent: true, type: "pickup" } : { sent: false, error: res.error };
  }

  if (!order.tracking_number) {
    return {
      sent: false,
      warning: "Numéro de suivi manquant : le mail d'expédition n'a pas été envoyé. Renseigne le suivi puis ré-enregistre la commande.",
    };
  }

  const res = await sendShippedEmail({ ...common, trackingNumber: order.tracking_number });
  return res.ok ? { sent: true, type: "shipped" } : { sent: false, error: res.error };
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
