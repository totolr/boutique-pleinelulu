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

- [x] 🟡 **Inverser les sections "À propos" et "Retrait"**
  Menu remis dans l'ordre du défilement : Boutique -> À propos -> Retrait (desktop + mobile).

- [x] 🟡 **Écrire "RDV" en toutes lettres : "rendez-vous"**
  Corrigé dans le panier (label retrait + note commune).

- [x] 🟡 **Reformuler "on se cale"**
  Remplacé par "on fixe" dans le panier, l'onglet Retrait et le dashboard admin.

## 🔧 Infra & outils

- [x] 🟡 **Donner le LinkedIn de l'asso comme source de contexte**
  Publications représentatives fournies et ton/slogan ("Offrons la passion !") enregistrés en mémoire. À recompléter ponctuellement avec les nouvelles publis.
  Page LinkedIn de l'association : https://www.linkedin.com/company/98695995/

- [ ] ⚪ **Étudier la mise en place de GitHub Actions**
  À évaluer : utilité réelle pour le projet (build de vérification, déploiement automatique, contrôles à chaque commit). Prendre une décision go / no-go avant de creuser.

- [ ] 🟡 **Finaliser la configuration PostHog**
  Renseigner les "Authorized URLs" et le reverse proxy.
  Parcours dans PostHog : Web Analytics -> Installation health -> Configuration.
