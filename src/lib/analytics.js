import posthog from "posthog-js";

// Initialise PostHog une seule fois, UNIQUEMENT si l'utilisateur a consenti.
// Si la clé n'est pas définie, on log en console pour que le dev marche
// quand même sans compte PostHog.
//
// Conformité CNIL : aucun cookie/traceur de mesure d'audience n'est déposé
// tant que le visiteur n'a pas accepté via le bandeau (CookieBanner.jsx).
// Le choix est mémorisé dans localStorage et peut être modifié à tout moment.

const key = import.meta.env.VITE_POSTHOG_KEY;
const host = import.meta.env.VITE_POSTHOG_HOST || "https://eu.posthog.com";

const CONSENT_KEY = "pl_cookie_consent"; // "granted" | "denied" | null (pas encore choisi)

let initialized = false;

/** Renvoie le choix de l'utilisateur : "granted", "denied" ou null si pas encore décidé. */
export function getConsent() {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(CONSENT_KEY);
}

/** Initialise PostHog si (et seulement si) le consentement a été donné. */
export function initAnalytics() {
  if (initialized || !key) return;
  if (getConsent() !== "granted") return; // pas de mesure d'audience sans accord
  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    persistence: "localStorage",
  });
  initialized = true;
}

/** L'utilisateur accepte la mesure d'audience : on mémorise et on démarre PostHog. */
export function grantConsent() {
  if (typeof localStorage !== "undefined") localStorage.setItem(CONSENT_KEY, "granted");
  initAnalytics();
}

/** L'utilisateur refuse : on mémorise. PostHog n'ayant pas été initialisé, rien à arrêter. */
export function denyConsent() {
  if (typeof localStorage !== "undefined") localStorage.setItem(CONSENT_KEY, "denied");
}

/** Envoie un event (ou le log en console si PostHog non configuré / non consenti) */
export function track(event, props) {
  if (key && initialized) {
    posthog.capture(event, props);
  } else {
    console.log("[analytics]", event, props || "");
  }
}
