/*
 * _shipping : source de vérité unique pour l'éligibilité au retrait sur place.
 * Pour modifier la zone de retrait, éditer le seul tableau PICKUP_POSTAL_CODES
 * ci-dessous (ajouter ou retirer des codes postaux).
 */

// Codes postaux où le retrait sur place (gratuit) est proposé (sud de Nantes).
export const PICKUP_POSTAL_CODES = [
  "44830", // Brains, Bouaye
  "44620", // La Montagne
  "44640", // Saint-Jean-de-Boiseau, Le Pellerin
  "44680", // Saint-Mars-de-Coutais, Sainte-Pazanne
  "44860", // Saint-Aignan-de-Grand-Lieu
  "44710", // Port-Saint-Père, Saint-Léger-les-Vignes
  "44340", // Bouguenais
  "44400", // Rezé
];

// Frais de livraison à domicile, en centimes (doit rester cohérent avec create-checkout.js).
export const DELIVERY_AMOUNT_CENTS = 500;

export function isPickupEligible(postalCode) {
  const cp = String(postalCode || "").trim();
  return PICKUP_POSTAL_CODES.includes(cp);
}

// Verrouillage STRICT par commune : un code postal couvre parfois des communes
// voisines qu'on ne dessert pas (44640 = Le Pellerin mais aussi Rouans/Vue).
// Garder synchronisé avec src/lib/pickup-zones.js.
export const PICKUP_COMMUNES = [
  "Brains",
  "Bouaye",
  "La Montagne",
  "Saint-Jean-de-Boiseau",
  "Le Pellerin",
  "Saint-Mars-de-Coutais",
  "Sainte-Pazanne",
  "Saint-Aignan-de-Grand-Lieu",
  "Port-Saint-Père",
  "Saint-Léger-les-Vignes",
  "Bouguenais",
  "Rezé",
];

const normCommune = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

const PICKUP_COMMUNE_SET = new Set(PICKUP_COMMUNES.map(normCommune));

export function isPickupEligibleCommune(name) {
  return PICKUP_COMMUNE_SET.has(normCommune(name));
}
