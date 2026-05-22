import { createClient } from "@supabase/supabase-js";

// Client public (anon key) : lecture seule du stock côté navigateur.
// La clé anon est conçue pour être exposée : les RLS policies
// limitent ce qu'elle peut faire (ici : SELECT sur "stock" only).

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

/**
 * Récupère tout le stock.
 * Retourne : { productId: { "color-size": quantity } }
 */
export async function fetchStock() {
  if (!supabase) {
    console.warn("[supabase] non configuré : stock indisponible");
    return {};
  }

  const { data, error } = await supabase
    .from("stock")
    .select("product_id, color, size, quantity");

  if (error) {
    console.error("[supabase] erreur fetchStock:", error.message);
    return {};
  }

  const result = {};
  for (const row of data) {
    if (!result[row.product_id]) result[row.product_id] = {};
    result[row.product_id][`${row.color}-${row.size}`] = row.quantity;
  }
  return result;
}
