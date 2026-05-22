/*
 * Catalogue produits (affichage front). Pour ajouter ou modifier un produit,
 * éditer ce fichier. Le prix est en centimes (2500 = 25,00 €). Penser à ajouter
 * le stock correspondant dans Supabase (table "stock" ou supabase/schema.sql),
 * et à garder les prix synchronisés avec netlify/functions/_catalog.js.
 *
 * Photos produit (optionnel) :
 *   1. Déposer les images dans public/products/.
 *   2. Renseigner soit "image" (une photo pour tout le produit), soit "images"
 *      (une photo par couleur, clé = code couleur).
 *   3. Le chemin commence par "/products/..." (public/ est servi à la racine).
 * Si la photo est absente ou introuvable, l'affichage retombe sur le visuel
 * par défaut.
 */

export const COLOR_NAMES = {
  "#0055A4": "Bleu France",
  "#ffffff": "Blanc",
};

export const SIZES = ["S", "M", "L", "XL"];

export const PRODUCTS = [
  {
    id: "tee-coupe-monde-2026",
    name: "T-Shirt Coupe du Monde 2026",
    desc: "Édition spéciale : coton bio, supporte les Bleus",
    price: 2500,
    badge: "Édition limitée",
    colors: ["#0055A4", "#ffffff"],
    // Photos par couleur. Dépose les fichiers dans public/products/ (mêmes noms),
    // ou change les chemins ci-dessous. Tant que les fichiers ne sont pas là,
    // le visuel par défaut (silhouette colorée) s'affiche.
    images: {
      "#0055A4": "/products/tee-coupe-monde-2026-bleu.jpg",
      "#ffffff": "/products/tee-coupe-monde-2026-blanc.jpg",
    },
  },
];

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

// Photo à afficher pour un produit/couleur : photo de la couleur, sinon photo
// générique du produit, sinon null (l'appelant affiche un visuel de repli).
export function getProductImage(product, color) {
  if (!product) return null;
  return (product.images && product.images[color]) || product.image || null;
}

export function formatPrice(cents) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
