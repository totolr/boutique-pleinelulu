# Pleine Lulu

Boutique e-commerce de l'association sportive Pleine Lulu (loi 1901).

L'achat se fait sans compte client : le panier est gardé en local dans le
navigateur, le paiement passe par Stripe Checkout.

**Stack** : Vite + React, Stripe via Netlify Functions, Supabase pour le stock
et les commandes, Resend pour les emails transactionnels, PostHog pour
l'analytics, le tout hébergé sur Netlify.

## Mise en route (local)

### Prérequis

- Node.js 18 ou plus
- Un compte Stripe, Supabase, Netlify et Resend (tous gratuits pour commencer)
- Netlify CLI : `npm install -g netlify-cli`

### Installation

```bash
npm install
cp .env.example .env     # puis renseigner les clés (voir plus bas)
```

### Lancer en local

```bash
npm run netlify          # lance Vite et les Netlify Functions ensemble
```

Utiliser `npm run netlify`, pas `npm run dev` : les fonctions Stripe (`/api/...`)
ne tournent qu'avec `netlify dev`. Le site s'ouvre sur http://localhost:8888.

## Configuration des services

### 1. Supabase (stock et commandes)

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, coller le contenu de `supabase/schema.sql` puis exécuter.
   Cela crée les tables `stock` et `orders`, la fonction `decrement_stock`, la
   numérotation des commandes et le stock initial.
3. Dans **Settings > API**, copier dans `.env` :
   - `Project URL` vers `VITE_SUPABASE_URL`
   - clé `anon` vers `VITE_SUPABASE_ANON_KEY`
   - clé `service_role` vers `SUPABASE_SERVICE_ROLE_KEY` (secrète, jamais exposée)

### 2. Stripe (paiements)

1. Sur [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys),
   copier dans `.env` :
   - clé publique `pk_test_...` vers `VITE_STRIPE_PUBLISHABLE_KEY`
   - clé secrète `sk_test_...` vers `STRIPE_SECRET_KEY`
2. Le webhook (`STRIPE_WEBHOOK_SECRET`) se configure plus bas.

### 3. Resend (emails de confirmation)

1. Créer une clé sur [resend.com](https://resend.com) et la copier dans
   `RESEND_API_KEY`.
2. Tant que le domaine n'est pas vérifié, garder l'expéditeur par défaut
   `onboarding@resend.dev` (Resend n'enverra alors qu'à l'adresse du compte).
   Une fois le domaine vérifié, passer à `Pleine Lulu <commande@pleinelulu.fr>`.

### 4. PostHog (analytics)

1. Créer un projet sur [eu.posthog.com](https://eu.posthog.com) (région EU pour
   le RGPD).
2. Copier la clé `phc_...` dans `VITE_POSTHOG_KEY`.

Sans clé PostHog, le site fonctionne quand même : les événements sont affichés
dans la console au lieu d'être envoyés.

## Tester un paiement en local

Le webhook Stripe doit recevoir les événements. En local, il faut deux terminaux :

```bash
# Terminal 1 : le site
npm run netlify

# Terminal 2 : écoute des webhooks Stripe
stripe login
stripe listen --forward-to localhost:8888/api/stripe-webhook
```

`stripe listen` affiche un secret `whsec_...`. Le coller dans `.env` sous
`STRIPE_WEBHOOK_SECRET`, puis relancer `npm run netlify`.

Carte de test : `4242 4242 4242 4242`, date future, n'importe quel CVC.

Après le paiement test, vérifier dans Supabase que la table `orders` contient
une nouvelle ligne et que la table `stock` a bien été décrémentée.

## Déploiement sur Netlify

### Via l'interface

1. Pousser le code sur un dépôt Git (le dépôt peut rester privé).
2. Sur [app.netlify.com](https://app.netlify.com), choisir **Add new site**
   puis **Import from Git**.
3. Netlify détecte `netlify.toml` automatiquement (build : `npm run build`).
4. Dans **Site settings > Environment variables**, ajouter toutes les variables
   du `.env`, avec les clés `pk_live_` / `sk_live_` pour la vraie production.
5. Déployer.

### Configurer le webhook Stripe en production

Une fois le site en ligne :

1. Sur [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks),
   choisir **Add endpoint**.
2. URL : `https://<domaine>.netlify.app/api/stripe-webhook`.
3. Événement à écouter : `checkout.session.completed`.
4. Copier le `whsec_...` dans les variables d'environnement Netlify sous
   `STRIPE_WEBHOOK_SECRET`.
5. Redéployer.

## Gérer la boutique

### Modifier les produits

Éditer `src/lib/products.js` (catalogue affiché) **et**
`netlify/functions/_catalog.js` (prix vérifiés côté serveur). Les deux doivent
rester synchronisés : mêmes `id`, mêmes prix.

Pourquoi deux fichiers : le serveur ne fait jamais confiance au prix envoyé par
le navigateur, qu'un client pourrait modifier. Il recalcule tout depuis
`_catalog.js`.

### Gérer le stock

Le stock vit dans la table `stock` de Supabase, et peut être édité depuis le
dashboard `/admin` (onglet Stock) ou directement dans **Supabase > Table Editor**.

La boutique se rafraîchit toutes les 30 secondes. Quand une variante tombe à 0,
la taille est barrée et "Rupture de stock" s'affiche.

### Suivre les commandes

Le dashboard `/admin` permet aux bénévoles de suivre les commandes, changer leur
statut, ajouter un numéro de suivi et déclencher les emails au client. Voir la
section Dashboard admin plus bas. Les commandes sont aussi consultables dans
**Supabase > Table Editor > orders**.

## Architecture

```
Navigateur (React)
   |
   |  POST /api/create-checkout
   v
Netlify Function ---> vérifie le stock (Supabase)
   |                  calcule le prix (catalogue serveur)
   |                  crée la session Stripe
   v
Page de paiement Stripe
   |
   |  paiement réussi
   v
Netlify Function (webhook) ---> décrémente le stock (Supabase)
                                enregistre la commande
                                envoie l'email de confirmation (Resend)
```

Le navigateur lit le stock via la clé `anon` Supabase, qui n'a le droit qu'au
`SELECT` grâce aux politiques RLS. Toutes les écritures passent par les Netlify
Functions, qui utilisent la clé `service_role` (jamais exposée au client).

## Structure

```
.
├── index.html                  point d'entrée et balises SEO
├── netlify.toml                build et redirections /api/*
├── vite.config.js
├── src/
│   ├── main.jsx                bootstrap React
│   ├── App.jsx                 page principale (nav, hero, grille produits)
│   ├── index.css
│   ├── pages/
│   │   └── Admin.jsx           dashboard /admin (commandes et stock)
│   ├── components/
│   │   ├── Logo.jsx
│   │   ├── ProductCard.jsx     carte produit et sélection couleur/taille
│   │   ├── ProductImage.jsx    image produit avec visuel de repli
│   │   └── CartDrawer.jsx      panier et bouton de paiement
│   └── lib/
│       ├── products.js         catalogue front (affichage)
│       ├── cart.jsx            état du panier (localStorage)
│       ├── supabase.js         lecture du stock
│       └── analytics.js        PostHog
├── netlify/functions/
│   ├── _catalog.js             catalogue serveur (prix de référence)
│   ├── _shipping.js            éligibilité au retrait, frais de port
│   ├── _email.js               emails expédition / retrait (Resend)
│   ├── _admin-auth.js          auth partagée des endpoints admin
│   ├── create-checkout.js      crée la session Stripe
│   ├── stripe-webhook.js       décrémente le stock, enregistre la commande
│   ├── admin-orders.js         API du dashboard : commandes
│   └── admin-stock.js          API du dashboard : stock
└── supabase/
    └── schema.sql              à exécuter dans Supabase
```

## Dashboard admin

`/admin` est une page de suivi des commandes destinée aux bénévoles non
techniques. L'authentification se fait par lien magique Supabase Auth
(passwordless) doublée d'une whitelist serveur (`ADMIN_EMAILS`).

Le front envoie le JWT Supabase dans l'en-tête `Authorization: Bearer ...`. Côté
serveur, `_admin-auth.js` valide le token via `supabase.auth.getUser()` puis
vérifie que l'email figure dans la whitelist.

Configuration à faire une fois dans le dashboard Supabase :

1. **Authentication > Providers > Email** : laisser activé.
2. **Allow new users to sign up** : désactiver (sinon n'importe qui peut créer
   un compte).
3. **Authentication > Users > Add user** : créer manuellement chaque compte admin.
4. **Authentication > URL Configuration > Redirect URLs** : ajouter
   `http://localhost:8888/admin` et `https://<domaine>/admin`.

Statuts d'une commande : `paid`, `preparing`, `shipped`, `delivered`,
`cancelled`. La numérotation `PL-YYYY-NNNN` est gérée par un trigger Postgres
(voir `schema.sql`).

## Variables d'environnement

Les variables préfixées `VITE_` sont incluses dans le bundle client (publiques
par conception) : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_POSTHOG_KEY`.

Les secrets serveur ne portent jamais le préfixe `VITE_` et ne doivent pas être
renommés avec : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ADMIN_EMAILS`.

## SEO

Le SEO technique est en place dans `index.html` : titre, meta description,
Open Graph, Twitter Card, données structurées JSON-LD, avec le domaine
`https://pleinelulu.fr`. Reste à créer une image `public/og-image.png`
(1200x630) pour les partages.

## Coûts

| Service  | Coût |
|----------|------|
| Netlify  | Gratuit (100 Go/mois, 125k appels de fonctions) |
| Supabase | Gratuit (jusqu'à 500 Mo) |
| Resend   | Gratuit (3000 emails/mois) |
| PostHog  | Gratuit (1M événements/mois) |
| Stripe   | 1,5% + 0,25 € par transaction |

## Licence

Code et contenus © Pleine Lulu, tous droits réservés. Le dépôt est public à
titre de consultation : toute réutilisation du code, des visuels, des logos ou
des textes nécessite l'accord écrit préalable de l'association
(contact@pleinelulu.fr).
