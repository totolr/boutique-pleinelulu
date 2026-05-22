/*
 * stripe-webhook : Stripe appelle cette URL après chaque paiement. La fonction
 * vérifie la signature, décrémente le stock dans Supabase de façon atomique,
 * enregistre la commande et envoie un mail de confirmation au client (Resend).
 *
 * À configurer dans dashboard.stripe.com/webhooks :
 *   URL    : https://<domaine>.netlify.app/api/stripe-webhook
 *   Event  : checkout.session.completed
 */

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { PRODUCTS, COLOR_NAMES } from "./_catalog.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function handler(event) {
  const sig = event.headers["stripe-signature"];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Signature webhook invalide:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;

    let cart = [];
    try {
      cart = JSON.parse(session.metadata?.cart || "[]");
    } catch {
      console.error("Impossible de parser le panier depuis metadata");
    }

    for (const item of cart) {
      const { data, error } = await supabase.rpc("decrement_stock", {
        p_product_id: item.productId,
        p_color: item.color,
        p_size: item.size,
        p_quantity: item.qty,
      });
      if (error) {
        console.error("Erreur décrément stock:", error.message);
      } else if (data === false) {
        console.error(`Stock devenu insuffisant : ${item.productId} ${item.size}`);
      }
    }

    // Mode de livraison : valeur explicite posée par create-checkout, sinon
    // fallback heuristique (port > 0 = livraison, sinon retrait).
    const shippingMethod =
      session.metadata?.shipping_method ||
      ((session.shipping_cost?.amount_total ?? 0) > 0 ? "delivery" : "pickup");

    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email || null,
        customer_name: session.customer_details?.name || null,
        amount_total: session.amount_total,
        items: cart,
        status: "paid",
        shipping_method: shippingMethod,
        shipping_address: session.shipping_details || null,
        billing_address: session.customer_details?.address || null,
      })
      .select("order_number")
      .single();

    const orderNumber = orderRow?.order_number || null;

    if (orderError) {
      console.error("Erreur enregistrement commande:", orderError.message);
    } else {
      console.log("Commande enregistrée:", orderNumber, session.id);
    }

    await sendConfirmationEmail(session, cart, orderNumber);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
}

async function sendConfirmationEmail(session, cart, orderNumber) {
  const to = session.customer_details?.email;
  if (!resend) {
    console.warn("[mail] RESEND_API_KEY absente, pas d'envoi");
    return;
  }
  if (!to) {
    console.warn("[mail] pas d'email client, pas d'envoi");
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || "Pleine Lulu <onboarding@resend.dev>";
  const firstName = (session.customer_details?.name || "").split(" ")[0] || "";
  const subject = orderNumber
    ? `Commande ${orderNumber} confirmée - Pleine Lulu`
    : "Merci pour ta commande Pleine Lulu";

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: "contact@pleinelulu.fr",
      subject,
      html: buildEmailHtml({ session, cart, firstName, orderNumber }),
    });
    if (error) {
      console.error("[mail] erreur Resend:", error);
    } else {
      console.log("[mail] envoyé à", to);
    }
  } catch (err) {
    console.error("[mail] exception Resend:", err.message);
  }
}

function buildEmailHtml({ session, cart, firstName, orderNumber }) {
  const totalFmt = formatEUR(session.amount_total);
  const shippingAmount = session.shipping_cost?.amount_total ?? 0;
  const shippingLabel = session.shipping_cost?.shipping_rate
    ? "" // rempli ci-dessous si on a le rate_data inline
    : "";
  const shipping = session.shipping_details || session.customer_details;
  const addr = shipping?.address;

  const itemsHtml = cart
    .map((item) => {
      const product = PRODUCTS[item.productId];
      const name = product?.name || item.productId;
      const unit = product?.price ?? 0;
      const lineTotal = unit * item.qty;
      const colorName = COLOR_NAMES[item.color] || item.color;
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;">
            <div style="font-weight:600;color:#1a1a1a;">${escape(name)}</div>
            <div style="font-size:12px;color:#999;margin-top:2px;">${escape(colorName)} · ${escape(item.size)} · x${item.qty}</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:700;text-align:right;color:#1a1a1a;white-space:nowrap;">
            ${formatEUR(lineTotal)}
          </td>
        </tr>`;
    })
    .join("");

  const addressBlock = addr
    ? `${escape(shipping?.name || "")}<br>${escape(addr.line1 || "")}${addr.line2 ? "<br>" + escape(addr.line2) : ""}<br>${escape(addr.postal_code || "")} ${escape(addr.city || "")}<br>${escape(addr.country || "")}`
    : "Retrait sur place";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Confirmation de commande</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:580px;margin:0 auto;padding:32px 16px;">

    <div style="background:#1a1a1a;color:#fff;padding:28px 32px;border-radius:14px 14px 0 0;">
      <div style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;color:#fff;">
        <span style="color:#0055A4;">●</span> Pleine Lulu <span style="color:#EF4135;">●</span>
      </div>
      <div style="font-size:23px;font-weight:800;letter-spacing:-0.3px;line-height:1.2;">
        Merci ${firstName ? escape(firstName) + ", " : ""}ta commande est confirmée 🎉
      </div>
      ${orderNumber
        ? `<div style="font-size:12px;color:#bbb;margin-top:10px;letter-spacing:1px;">
             N° de commande : <span style="color:#fff;font-weight:700;">${escape(orderNumber)}</span>
           </div>`
        : ""}
    </div>

    <div style="background:#fff;padding:28px 32px;">
      <p style="font-size:15px;line-height:1.55;margin:0 0 22px;color:#333;">
        Ton paiement est bien arrivé. En achetant chez nous, tu finances directement les activités sportives de l'asso. Merci beaucoup pour ton soutien.
      </p>

      <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#999;margin:0 0 12px;">
        Récap de ta commande
      </div>
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        ${itemsHtml}
        ${shippingAmount > 0
          ? `<tr>
              <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#666;">Livraison</td>
              <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;text-align:right;color:#666;white-space:nowrap;">${formatEUR(shippingAmount)}</td>
            </tr>`
          : ""}
        <tr>
          <td style="padding:16px 0 0;font-size:15px;font-weight:700;color:#1a1a1a;">Total</td>
          <td style="padding:16px 0 0;font-size:22px;font-weight:800;text-align:right;color:#1a1a1a;white-space:nowrap;">${totalFmt}</td>
        </tr>
      </table>

      <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#999;margin:28px 0 10px;">
        Livraison
      </div>
      <div style="font-size:14px;line-height:1.5;color:#333;background:#f5f5f5;border-radius:10px;padding:14px 16px;">
        ${addressBlock}
      </div>

      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f0f0f0;font-size:13px;color:#666;line-height:1.55;">
        On prépare ton colis dans les prochains jours. Tu reçois un nouveau mail dès que c'est expédié. Pour toute question, réponds simplement à ce mail.
      </div>
    </div>

    <div style="background:#fff;border-radius:0 0 14px 14px;padding:18px 32px;text-align:center;font-size:12px;color:#999;border-top:1px solid #f0f0f0;">
      Pleine Lulu · Association loi 1901 · contact@pleinelulu.fr
    </div>

  </div>
</body>
</html>`;
}

function formatEUR(cents) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format((cents || 0) / 100);
}

function escape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Stripe a besoin du body brut (non parsé) pour vérifier la signature
export const config = { bodyParser: false };
