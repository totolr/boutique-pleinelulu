/* Catalogue côté serveur : source de vérité pour les PRIX.
   On ne fait JAMAIS confiance au prix envoyé par le navigateur :
   les functions recalculent toujours depuis ce fichier.
   Garde-le synchronisé avec src/lib/products.js (mêmes id/prix). */

export const PRODUCTS = {
  "tee-coupe-monde-2026": { name: "T-Shirt Coupe du Monde 2026", price: 2500 },
};

export const COLOR_NAMES = {
  "#0055A4": "Bleu France",
  "#ffffff": "Blanc",
};
