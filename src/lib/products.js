/*
 * Catalogue produits (affichage front). Pour ajouter/modifier un produit, éditer
 * ce fichier. Prix en centimes (2499 = 24,99 €). Garder les prix synchronisés
 * avec netlify/functions/_catalog.js (mêmes id + prix).
 *
 * Mode PRÉCOMMANDE (modulaire) : un produit avec `preorder: true` n'a PAS de
 * gestion de stock (commandable en permanence, fabriqué à la commande). Un
 * produit SANS ce flag est géré au stock comme avant (table Supabase "stock").
 * Pour repasser un produit en stock : enlever `preorder` et créer ses lignes de
 * stock dans Supabase. Le suivi des commandes (admin) est identique dans les
 * deux cas.
 *
 * Photos produit : 3 vues par produit, dans l'ordre coeur zoomé / avant / dos.
 *   1. Déposer les images dans public/products/ (idéalement en .webp).
 *   2. Renseigner le tableau "photos" ci-dessous (chemins "/products/...").
 * Si une photo manque, un visuel de repli s'affiche automatiquement.
 *
 * Couleurs : tableau "colors". Une seule couleur = pas de sélecteur affiché.
 */

export const COLOR_NAMES = {
  "#0055A4": "Bleu France",
  "#ffffff": "Blanc",
};

export const SIZES = ["XS", "S", "M", "L", "XL"];

export const PRODUCTS = [
  {
    id: "coupe-monde-2026",
    name: "T-Shirt Coupe du Monde 2026",
    desc: "Imprimé en France · 100% coton",
    price: 2499,
    badge: "Précommande",
    preorder: true,
    colors: ["#ffffff"],
    photos: [
      "/products/coupe-monde-2026-1.webp",
      "/products/coupe-monde-2026-2.webp",
      "/products/coupe-monde-2026-3.webp",
    ],
  },
  {
    id: "tricolore-2026",
    name: "T-Shirt Tricolore 2026",
    desc: "Imprimé en France · 100% coton",
    price: 1999,
    badge: "Précommande",
    preorder: true,
    colors: ["#ffffff"],
    photos: [
      "/products/tricolore-2026-1.webp",
      "/products/tricolore-2026-2.webp",
      "/products/tricolore-2026-3.webp",
    ],
  },
  {
    id: "bleus-2024",
    name: "T-Shirt Les Bleus 2024",
    desc: "Imprimé en France · 100% coton",
    price: 2999,
    badge: "Stock limité",
    colors: ["#ffffff"],
    photos: [
      "/products/bleus-2024-1.webp",
      "/products/bleus-2024-2.webp",
      "/products/bleus-2024-3.webp",
    ],
  },
  {
    id: "nantes-fc",
    name: "T-Shirt Nantes FC",
    desc: "Imprimé en France · 100% coton",
    price: 1499,
    badge: "Stock limité",
    colors: ["#ffffff"],
    // Dos identique au Tricolore (t-shirt tout blanc dans le dos).
    photos: [
      "/products/nantes-fc-1.webp",
      "/products/nantes-fc-2.webp",
      "/products/tricolore-2026-3.webp",
    ],
  },
];

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

// Liste ordonnée des photos d'un produit (coeur, avant, dos).
export function getProductPhotos(product) {
  if (!product) return [];
  if (Array.isArray(product.photos)) return product.photos;
  if (product.image) return [product.image];
  return [];
}

// Photo principale (1re vue) : pour les vignettes panier/admin. Le param color
// est conservé pour compat (anciennes commandes), mais on privilégie photos[0].
export function getProductImage(product, color) {
  if (!product) return null;
  const photos = getProductPhotos(product);
  if (photos.length) return photos[0];
  return (product.images && product.images[color]) || product.image || null;
}

export function formatPrice(cents) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
