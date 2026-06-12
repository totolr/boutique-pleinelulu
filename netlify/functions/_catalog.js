/* Catalogue côté serveur : source de vérité pour les PRIX.
   On ne fait JAMAIS confiance au prix envoyé par le navigateur :
   les functions recalculent toujours depuis ce fichier.
   Garde-le synchronisé avec src/lib/products.js (mêmes id + prix). */

// preorder: true -> pas de contrôle de stock (fabriqué à la commande).
// Retirer le flag + créer les lignes de stock Supabase pour repasser en stock.
export const PRODUCTS = {
  "coupe-monde-2026": { name: "T-Shirt Coupe du Monde 2026", price: 2499, preorder: true },
  "tricolore-2026": { name: "T-Shirt Tricolore 2026", price: 1999, preorder: true },
  "bleus-2024": { name: "T-Shirt Les Bleus 2024", price: 2999 },
  "nantes-fc": { name: "T-Shirt Nantes FC", price: 1499 },
};

export const COLOR_NAMES = {
  "#0055A4": "Bleu France",
  "#ffffff": "Blanc",
};
