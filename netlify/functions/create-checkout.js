/*
 * create-checkout : appelée par le front via POST /api/create-checkout.
 * Vérifie le stock dans Supabase, crée une session Stripe Checkout avec des
 * prix recalculés côté serveur, et renvoie l'URL de paiement au navigateur.
 */

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS, COLOR_NAMES } from "./_catalog.js";
import { isPickupEligible, DELIVERY_AMOUNT_CENTS } from "./_shipping.js";

const stripeMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live")
  ? "LIVE"
  : process.env.STRIPE_SECRET_KEY?.startsWith("sk_test")
    ? "TEST"
    : "MISSING";
console.log(`[stripe] mode=${stripeMode} url=${process.env.URL || "localhost"}`);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// service_role : accès complet, bypasse RLS, réservé au serveur
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { items, shippingMethod, postalCode } = JSON.parse(event.body || "{}");

    if (!items || items.length === 0) {
      return json(400, { error: "Panier vide" });
    }

    // Mode de livraison : le serveur tranche, jamais le client.
    const method = shippingMethod === "pickup" ? "pickup" : "delivery";
    if (method === "pickup" && !isPickupEligible(postalCode)) {
      return json(400, {
        error: "Le retrait sur place n'est pas disponible pour ce code postal. Choisis la livraison à domicile.",
      });
    }

    // 1. Vérification du stock
    const outOfStock = [];
    for (const item of items) {
      const { data } = await supabase
        .from("stock")
        .select("quantity")
        .eq("product_id", item.productId)
        .eq("color", item.color)
        .eq("size", item.size)
        .single();

      const available = data?.quantity ?? 0;
      if (available < item.qty) {
        const p = PRODUCTS[item.productId];
        outOfStock.push(
          `${p?.name || item.productId} (${COLOR_NAMES[item.color] || item.color}, ${item.size}) : ${available} dispo, ${item.qty} demandé`
        );
      }
    }

    if (outOfStock.length > 0) {
      return json(409, { error: "Stock insuffisant", details: outOfStock });
    }

    // 2. Construction des line_items (prix serveur)
    const line_items = items.map((item) => {
      const product = PRODUCTS[item.productId];
      if (!product) throw new Error(`Produit inconnu : ${item.productId}`);

      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
            description: `${COLOR_NAMES[item.color] || item.color} - Taille ${item.size}`,
          },
          unit_amount: product.price, // ← prix depuis le catalogue serveur
        },
        quantity: item.qty,
      };
    });

    const baseUrl = process.env.URL || "http://localhost:8888";

    // Livraison : Stripe collecte l'adresse + applique les frais de port.
    // Retrait : aucune adresse, aucun frais (le RDV se cale ensuite via Instagram).
    const shippingConfig =
      method === "pickup"
        ? {}
        : {
            shipping_address_collection: { allowed_countries: ["FR"] },
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: { amount: DELIVERY_AMOUNT_CENTS, currency: "eur" },
                  display_name: "Livraison standard (5-7 j)",
                },
              },
            ],
          };

    // 3. Création de la session Stripe
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // payment_method_types: ["card", "link"], // par défaut ce qu'on a configuré dans Stripe Dashboard
      line_items,
      // Toujours collecter nom + adresse de facturation (pour la facture et pour
      // avoir le nom du client, y compris en retrait sur place sans adresse de livraison).
      billing_address_collection: "required",
      ...shippingConfig,
      success_url: `${baseUrl}/?success=1`,
      cancel_url: `${baseUrl}/?canceled=1`,
      // Stripe génère et envoie une vraie facture PDF au client (numéro Stripe officiel)
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: "Pleine Lulu - Association loi 1901",
          footer: "Merci pour ton soutien. 100% des bénéfices financent le sport pour tous.",
        },
      },
      // metadata : panier (pour décrémenter le stock) + mode de livraison (lu par le webhook)
      metadata: { cart: JSON.stringify(items), shipping_method: method },
    });

    return json(200, { url: session.url });
  } catch (err) {
    console.error("create-checkout:", err.message);
    return json(500, { error: "Erreur lors de la création du paiement" });
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
