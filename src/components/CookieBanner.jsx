import { useState, useEffect } from "react";
import { getConsent, grantConsent, denyConsent } from "../lib/analytics.js";

/*
 * Bandeau de consentement aux cookies, conforme aux recommandations CNIL :
 * - "Accepter" et "Refuser" sont au même niveau (même taille, même visibilité) ;
 * - aucun traceur de mesure d'audience (PostHog) n'est déposé avant le choix ;
 * - le visiteur peut rouvrir ses préférences à tout moment (lien du pied de page
 *   qui dispatche l'event "pl-open-cookie-prefs").
 *
 * Le seul cookie/traceur non essentiel du site est PostHog (statistiques de
 * fréquentation). Le panier et le choix de consentement utilisent le stockage
 * local strictement nécessaire au fonctionnement, exempté de consentement.
 */

const btnBase = {
  border: "1px solid #1a1a1a",
  borderRadius: 10,
  padding: "10px 18px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
};

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getConsent()) setVisible(true);
    const reopen = () => setVisible(true);
    window.addEventListener("pl-open-cookie-prefs", reopen);
    return () => window.removeEventListener("pl-open-cookie-prefs", reopen);
  }, []);

  if (!visible) return null;

  const accept = () => {
    grantConsent();
    setVisible(false);
  };
  const refuse = () => {
    denyConsent();
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 200,
        maxWidth: 560,
        margin: "0 auto",
        background: "#fff",
        border: "1px solid #00000014",
        borderRadius: 16,
        boxShadow: "0 16px 48px #00000026",
        padding: "20px 22px",
      }}
    >
      <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, color: "#1a1a1a" }}>
        🍪 On respecte ta vie privée
      </p>
      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#555", marginBottom: 16 }}>
        On utilise un outil de mesure d'audience (PostHog) pour comprendre comment le site
        est visité et l'améliorer. Aucune statistique n'est collectée sans ton accord. Tu peux
        accepter, refuser, ou en savoir plus dans notre{" "}
        <a href="/confidentialite" style={{ color: "#0055A4", fontWeight: 700 }}>
          politique de confidentialité
        </a>
        .
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={accept}
          style={{ ...btnBase, background: "#1a1a1a", color: "#fff", flex: "1 1 140px" }}
        >
          Tout accepter
        </button>
        <button
          onClick={refuse}
          style={{ ...btnBase, background: "#fff", color: "#1a1a1a", flex: "1 1 140px" }}
        >
          Tout refuser
        </button>
      </div>
    </div>
  );
}
