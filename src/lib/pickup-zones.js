/*
 * Communes éligibles au retrait sur place (sud de Nantes).
 * Source de vérité FRONT : utilisée par le sélecteur du panier (CartDrawer) et
 * par la carte (MapZone). Le serveur revalide de son côté dans
 * netlify/functions/_shipping.js : garder les deux listes synchronisées.
 */
export const PICKUP_COMMUNES = [
  { name: "Brains", cp: "44830" },
  { name: "Bouaye", cp: "44830" },
  { name: "La Montagne", cp: "44620" },
  { name: "Saint-Jean-de-Boiseau", cp: "44640" },
  { name: "Le Pellerin", cp: "44640" },
  { name: "Saint-Mars-de-Coutais", cp: "44680" },
  { name: "Sainte-Pazanne", cp: "44680" },
  { name: "Saint-Aignan-de-Grand-Lieu", cp: "44860" },
  { name: "Port-Saint-Père", cp: "44710" },
  { name: "Saint-Léger-les-Vignes", cp: "44710" },
  { name: "Bouguenais", cp: "44340" },
  { name: "Rezé", cp: "44400" },
];
