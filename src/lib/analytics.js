import posthog from "posthog-js";

// Initialise PostHog une seule fois.
// Si la clé n'est pas définie, on fournit un stub qui log en console
// pour que le dev marche quand même sans compte PostHog.

const key = import.meta.env.VITE_POSTHOG_KEY;
const host = import.meta.env.VITE_POSTHOG_HOST || "https://eu.posthog.com";

let initialized = false;

export function initAnalytics() {
  if (initialized || !key) return;
  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    persistence: "localStorage",
  });
  initialized = true;
}

/** Envoie un event (ou le log en console si PostHog non configuré) */
export function track(event, props) {
  if (key && initialized) {
    posthog.capture(event, props);
  } else {
    console.log("[analytics]", event, props || "");
  }
}
