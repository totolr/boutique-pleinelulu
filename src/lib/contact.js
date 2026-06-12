/*
 * Coordonnées de contact de l'asso (front). Source unique pour le pseudo
 * Instagram et l'email, réutilisée partout où on invite à nous contacter.
 * Côté serveur, les emails transactionnels ont leur propre constante dans
 * netlify/functions/_email.js : garder les deux cohérentes.
 */
export const INSTAGRAM_HANDLE = "@pleine.lulu";
export const INSTAGRAM_URL = "https://www.instagram.com/pleine.lulu/";
export const CONTACT_EMAIL = "contact@pleinelulu.fr";
