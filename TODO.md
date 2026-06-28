# TODO - Boutique Pleine Lulu

Suivi des tâches en cours. Coche `- [x]` quand une tâche est terminée.

Priorités : 🔴 haute · 🟡 moyenne · ⚪ basse

---

## 🐞 Bugs

- [ ] 🟡 **Champ "numéro de colis" sur une commande en retrait sur place**
  Le tunnel demande un numéro de suivi alors que la commande est récupérée en main propre. Sans impact réel aujourd'hui, mais à nettoyer : masquer ou retirer ce champ quand le mode choisi est le retrait.

## 🛒 Parcours d'achat (panier & shop)

- [ ] 🔴 **Confirmation "Ajouté au panier" trop fugace**
  L'animation du bouton "Ajouté" disparaît trop vite : on ne sent pas que l'article a bien été pris en compte. Rendre le retour plus explicite et plus durable, par exemple un bouton qui reste sur "Ajouté ✓" plus longtemps, un petit message de confirmation, ou le compteur du panier qui s'anime.

- [ ] 🔴 **Vérifier le stock plus tôt dans le parcours**
  Aujourd'hui l'indisponibilité n'apparaît qu'au clic "Payer avec Stripe", c'est trop tard : le panier est déjà bouclé. Vérifier la disponibilité dès le "+" de quantité. Pistes : plafonner automatiquement à la quantité réellement en stock, et signaler visuellement l'indispo (taille ou coloris grisé, ou passé en orange "plus dispo").

- [ ] 🟡 **Saisie directe de la quantité sur la fiche produit**
  Permettre de taper une quantité avant d'ajouter au panier (ex : saisir "3" puis cliquer sur "Ajouter au panier"), tout en gardant la possibilité d'ajuster ensuite depuis le panier. Objectif : composer vite une grosse commande, puis corriger facilement en cas d'oubli (en ajouter un, en retirer un).

## ✍️ Contenu & textes

- [ ] 🔴 **Réécrire le texte d'intro / "À propos"**
  Le texte actuel sonne trop artificiel. Repartir sur un ton humain et direct, dans l'esprit de :
  > Pleine Lulu, ça fait trois ans. On est juste trois à essayer de faire vivre un truc autour du football dans les quartiers populaires : des événements sur le terrain, et une boutique qui finance tout ça.

- [ ] 🟡 **Inverser les sections "À propos" et "Retrait"**
  Dans le défilement du site, "Retrait" arrive après "À propos". Remettre l'ordre des onglets ou sections cohérent avec ce défilement.

- [ ] 🟡 **Écrire "RDV" en toutes lettres : "rendez-vous"**
  Présent dans le shop et dans l'onglet Retrait.

- [ ] 🟡 **Reformuler "on se cale"**
  Tournure trop familière. La remplacer par quelque chose de plus neutre, par exemple "on convient d'un créneau" ou "on fixe un moment". Présent dans le shop et dans l'onglet Retrait.

## 🔧 Infra & outils

- [ ] 🟡 **Donner le LinkedIn de l'asso comme source de contexte**
  Page LinkedIn de l'association : https://www.linkedin.com/company/98695995/
  Objectif : nourrir la rédaction des textes et mieux coller au ton, à la mission et à l'actualité du projet (publications, communication, événements).

- [ ] ⚪ **Étudier la mise en place de GitHub Actions**
  À évaluer : utilité réelle pour le projet (build de vérification, déploiement automatique, contrôles à chaque commit). Prendre une décision go / no-go avant de creuser.

- [ ] 🟡 **Finaliser la configuration PostHog**
  Renseigner les "Authorized URLs" et le reverse proxy.
  Parcours dans PostHog : Web Analytics -> Installation health -> Configuration.
