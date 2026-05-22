/*
 * _shipping : source de vérité unique pour l'éligibilité au retrait sur place.
 * Pour modifier la zone de retrait, éditer le seul tableau PICKUP_POSTAL_CODES
 * ci-dessous (ajouter ou retirer des codes postaux).
 */

// Codes postaux où le retrait sur place (gratuit) est proposé.
export const PICKUP_POSTAL_CODES = ["44830"];

// Frais de livraison à domicile, en centimes (doit rester cohérent avec create-checkout.js).
export const DELIVERY_AMOUNT_CENTS = 500;

export function isPickupEligible(postalCode) {
  const cp = String(postalCode || "").trim();
  return PICKUP_POSTAL_CODES.includes(cp);
}
