/*
 * _email : envois transactionnels post-commande via Resend.
 *   sendShippedEmail     : commande expédiée (livraison La Poste, lien de suivi)
 *   sendPickupReadyEmail : commande prête à retirer (RDV via Instagram)
 *
 * Le mail de confirmation initial reste dans stripe-webhook.js.
 */

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.RESEND_FROM_EMAIL || "Pleine Lulu <onboarding@resend.dev>";
const REPLY_TO = "contact@pleinelulu.fr";
const INSTAGRAM_HANDLE = "@pleine.lulu";
const INSTAGRAM_URL = "https://www.instagram.com/pleine.lulu/";

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function laPosteTrackingUrl(trackingNumber) {
  return `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(trackingNumber)}`;
}

// Gabarit commun : header noir (accents drapeau), corps blanc, footer.
function emailShell({ headline, orderNumber, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(headline)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:580px;margin:0 auto;padding:32px 16px;">

    <div style="background:#1a1a1a;color:#fff;padding:28px 32px;border-radius:14px 14px 0 0;">
      <div style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;color:#fff;">
        <span style="color:#0055A4;">●</span> Pleine Lulu <span style="color:#EF4135;">●</span>
      </div>
      <div style="font-size:23px;font-weight:800;letter-spacing:-0.3px;line-height:1.2;">
        ${escapeHtml(headline)}
      </div>
      ${orderNumber
        ? `<div style="font-size:12px;color:#bbb;margin-top:10px;letter-spacing:1px;">
             N° de commande : <span style="color:#fff;font-weight:700;">${escapeHtml(orderNumber)}</span>
           </div>`
        : ""}
    </div>

    <div style="background:#fff;padding:28px 32px;">
      ${bodyHtml}
    </div>

    <div style="background:#fff;border-radius:0 0 14px 14px;padding:18px 32px;text-align:center;font-size:12px;color:#999;border-top:1px solid #f0f0f0;">
      Pleine Lulu · Association loi 1901 · contact@pleinelulu.fr
    </div>

  </div>
</body>
</html>`;
}

async function send({ to, subject, html }) {
  if (!resend) {
    console.warn("[mail] RESEND_API_KEY absente, pas d'envoi");
    return { ok: false, error: "RESEND_API_KEY absente" };
  }
  if (!to) {
    console.warn("[mail] pas d'email destinataire, pas d'envoi");
    return { ok: false, error: "email destinataire manquant" };
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, replyTo: REPLY_TO, subject, html });
    if (error) {
      console.error("[mail] erreur Resend:", error);
      return { ok: false, error: String(error.message || error) };
    }
    console.log("[mail] envoyé à", to);
    return { ok: true };
  } catch (err) {
    console.error("[mail] exception Resend:", err.message);
    return { ok: false, error: err.message };
  }
}

export async function sendShippedEmail({ to, firstName, orderNumber, trackingNumber }) {
  const hello = firstName ? `Bonjour ${escapeHtml(firstName)},` : "Bonjour,";
  const trackUrl = laPosteTrackingUrl(trackingNumber);
  const subject = orderNumber
    ? `Ta commande ${orderNumber} est en route - Pleine Lulu`
    : "Ta commande est en route - Pleine Lulu";

  const bodyHtml = `
    <p style="font-size:15px;line-height:1.55;margin:0 0 22px;color:#333;">
      ${hello} bonne nouvelle : ta commande vient de partir par La Poste. Tu peux suivre son acheminement avec le bouton ci-dessous.
    </p>

    <div style="text-align:center;margin:8px 0 26px;">
      <a href="${trackUrl}" style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;">
        Suivre mon colis
      </a>
    </div>

    <div style="font-size:13px;color:#666;line-height:1.6;background:#f5f5f5;border-radius:10px;padding:14px 16px;">
      Numéro de suivi : <span style="font-weight:700;color:#1a1a1a;">${escapeHtml(trackingNumber)}</span><br>
      Si le bouton ne marche pas, copie ce lien : <br>
      <span style="word-break:break-all;color:#0055A4;">${escapeHtml(trackUrl)}</span>
    </div>

    <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f0f0f0;font-size:13px;color:#666;line-height:1.55;">
      Le suivi peut mettre 24 h à s'activer côté La Poste. Une question ? Réponds simplement à ce mail.
    </div>`;

  return send({
    to,
    subject,
    html: emailShell({ headline: "Ta commande est expédiée 📦", orderNumber, bodyHtml }),
  });
}

export async function sendPickupReadyEmail({ to, firstName, orderNumber }) {
  const hello = firstName ? `Bonjour ${escapeHtml(firstName)},` : "Bonjour,";
  const subject = orderNumber
    ? `Ta commande ${orderNumber} est prête à retirer - Pleine Lulu`
    : "Ta commande est prête à retirer - Pleine Lulu";

  const bodyHtml = `
    <p style="font-size:15px;line-height:1.55;margin:0 0 22px;color:#333;">
      ${hello} ta commande est prête ! Comme tu as choisi le retrait sur place, écris-nous sur Instagram pour qu'on fixe ensemble un point et un horaire de rendez-vous.
    </p>

    <div style="text-align:center;margin:8px 0 26px;">
      <a href="${INSTAGRAM_URL}" style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;">
        Nous écrire sur Instagram
      </a>
    </div>

    <div style="font-size:13px;color:#666;line-height:1.6;background:#f5f5f5;border-radius:10px;padding:14px 16px;">
      Retrouve-nous en message privé sur <span style="font-weight:700;color:#1a1a1a;">${escapeHtml(INSTAGRAM_HANDLE)}</span>.
      Pense à nous donner ton numéro de commande${orderNumber ? ` (<span style="font-weight:700;color:#1a1a1a;">${escapeHtml(orderNumber)}</span>)` : ""} pour qu'on te retrouve vite.
    </div>

    <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f0f0f0;font-size:13px;color:#666;line-height:1.55;">
      Une question ? Réponds simplement à ce mail.
    </div>`;

  return send({
    to,
    subject,
    html: emailShell({ headline: "Ta commande t'attend 🤝", orderNumber, bodyHtml }),
  });
}
