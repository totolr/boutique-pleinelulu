import { INSTAGRAM_URL, LINKEDIN_URL } from "../lib/contact.js";

/*
 * Liens vers nos réseaux (Instagram, LinkedIn) sous forme d'icônes monochromes
 * discrètes. Réutilisable n'importe où ; les URL viennent de lib/contact.js.
 * La couleur suit `currentColor` et s'assombrit au survol (classe .pl-social).
 */

function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.83v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V23h-4v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.53 1.72-2.53 3.49V23h-4V8z" />
    </svg>
  );
}

export default function SocialLinks({ size = 20, gap = 16 }) {
  return (
    <div style={{ display: "flex", gap, justifyContent: "center", alignItems: "center" }}>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="pl-social"
        aria-label="Instagram Pleine Lulu"
      >
        <InstagramIcon size={size} />
      </a>
      <a
        href={LINKEDIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="pl-social"
        aria-label="LinkedIn Pleine Lulu"
      >
        <LinkedInIcon size={size} />
      </a>
    </div>
  );
}
