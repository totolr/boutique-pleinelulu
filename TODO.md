# Pleine Lulu · Backlog du site

Suivi des évolutions de la boutique pleinelulu.fr.
Dernière mise à jour : 30/06/2026 · 6 tâches ouvertes, 5 livrées.

## Légende

- **Priorité** : `P1` critique · `P2` important · `P3` confort
- **Statut** : 🔲 à faire · 🔄 en cours · ✅ livré
- **Domaines** : UX boutique · Contenu · Bug · Analytics · Infra

## Backlog

| ID | Priorité | Tâche | Domaine | Statut |
|:--:|:--:|-------|:--:|:--:|
| T1 | `P1` | Confirmation d'ajout au panier plus explicite | UX boutique | 🔲 |
| T2 | `P1` | Contrôler le stock plus tôt dans le parcours | UX boutique | 🔲 |
| T3 | `P2` | Saisir la quantité depuis la fiche produit | UX boutique | 🔲 |
| T4 | `P2` | Masquer le "numéro de colis" en retrait sur place | Bug | 🔲 |
| T5 | `P2` | Finaliser la configuration PostHog | Analytics | 🔲 |
| T6 | `P3` | Étudier la mise en place de GitHub Actions | Infra | 🔲 |

## Détail des tâches

### T1 · Confirmation d'ajout au panier plus explicite
`P1` · UX boutique · 🔲

Le bouton "Ajouté ✓" disparaît trop vite : on ne sent pas que l'article a été pris en compte.

Critères d'acceptation :
- [ ] Le retour visuel reste perceptible assez longtemps (ou via un message dédié).
- [ ] Le compteur du panier s'anime à chaque ajout.
- [ ] Vérifié sur mobile et desktop.

### T2 · Contrôler le stock plus tôt dans le parcours
`P1` · UX boutique · 🔲

Aujourd'hui l'indisponibilité n'apparaît qu'au clic "Payer", trop tard : le panier est déjà bouclé.

Critères d'acceptation :
- [ ] Disponibilité vérifiée dès le "+" de quantité.
- [ ] Quantité plafonnée au stock réel.
- [ ] Taille ou coloris indisponible signalé visuellement (grisé ou orange).

### T3 · Saisir la quantité depuis la fiche produit
`P2` · UX boutique · 🔲

Pouvoir choisir une quantité avant d'ajouter au panier, sans retirer l'ajustement existant depuis le panier.

Critères d'acceptation :
- [ ] Champ quantité sur la fiche produit.
- [ ] Ajustement toujours possible depuis le panier.
- [ ] Quantité bornée au stock disponible (dépend de T2).

### T4 · Masquer le "numéro de colis" en retrait sur place
`P2` · Bug · 🔲

Le tunnel demande un numéro de suivi alors que la commande est récupérée en main propre. Sans impact réel aujourd'hui, mais à nettoyer.

Critères d'acceptation :
- [ ] Le champ disparaît quand le mode "retrait sur place" est choisi.

### T5 · Finaliser la configuration PostHog
`P2` · Analytics · 🔲

Critères d'acceptation :
- [ ] "Authorized URLs" renseignées.
- [ ] Reverse proxy configuré.
- [ ] Parcours au vert : Web Analytics -> Installation health -> Configuration.

### T6 · Étudier la mise en place de GitHub Actions
`P3` · Infra · 🔲

À cadrer avant de creuser : build de vérification, déploiement, contrôles automatiques à chaque commit.

Critères d'acceptation :
- [ ] Décision go / no-go documentée (utilité réelle pour le projet).
- [ ] Si go : workflow minimal (build) en place.

## Livré

| Tâche | Domaine | Référence |
|-------|:--:|:--:|
| Réécriture des textes du site dans le ton de l'asso (hero, à propos, retrait, panier, bandeaux) | Contenu | PR #2 |
| Inversion des sections "À propos" et "Retrait" dans le menu | UX boutique | PR #2 |
| "RDV" écrit en toutes lettres ("rendez-vous") | Contenu | PR #2 |
| "On se cale" reformulé en "on fixe" | Contenu | PR #2 |
| LinkedIn de l'asso fourni comme source de contexte (ton et slogan enregistrés en mémoire) | Infra | - |
