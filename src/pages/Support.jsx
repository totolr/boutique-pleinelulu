import Logo from "../components/Logo.jsx";
import { CONTACT_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "../lib/contact.js";

/*
 * Page d'aide et de contact : /aide
 *
 * Sert de "Customer support URL" pour Stripe (champ Service client du
 * tableau de bord). Regroupe les moyens de nous joindre et répond aux
 * questions fréquentes (suivi, livraison, retours, paiement). Les détails
 * juridiques restent dans les CGV et la politique de confidentialité, vers
 * lesquelles cette page renvoie.
 */

const ADRESSE = "49 rue Germaine Dulac, 44830 Bouaye, France";

export default function SupportPage() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid #00000010", background: "#fff" }}>
        <div
          style={{
            maxWidth: 820,
            margin: "0 auto",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <a
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}
          >
            <Logo size={34} />
            <strong style={{ fontSize: 17 }}>Pleine Lulu</strong>
          </a>
          <a href="/" style={{ fontSize: 14, color: "#0055A4", fontWeight: 700, textDecoration: "none" }}>
            ← Retour à la boutique
          </a>
        </div>
      </header>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px 80px" }}>
        <article className="pl-legal">
          <h1 style={{ fontSize: "clamp(26px, 5vw, 36px)", fontWeight: 900, letterSpacing: -1, marginBottom: 8 }}>
            Aide et contact
          </h1>
          <p style={{ color: "#777", marginBottom: 28 }}>
            Une question sur une commande, la livraison, un retour ou un paiement ? On est une
            petite association et on répond nous-mêmes, en général sous 48 heures ouvrées.
          </p>

          <h2>Nous joindre</h2>
          <div className="pl-legal-block">
            <p style={{ marginBottom: 0 }}>
              <strong>Par courriel</strong> (le plus rapide) :{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              <br />
              <strong>Sur Instagram</strong> :{" "}
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                {INSTAGRAM_HANDLE}
              </a>
              <br />
              <strong>Par courrier</strong> : Pleine Lulu, {ADRESSE}
            </p>
          </div>
          <p>
            Pour qu'on vous réponde au plus vite, pensez à préciser votre{" "}
            <strong>numéro de commande</strong> (format PL-AAAA-NNNN, indiqué dans le courriel de
            confirmation) et l'adresse e-mail utilisée lors de l'achat.
          </p>

          <h2>Suivre ma commande</h2>
          <p>
            Après le paiement, vous recevez un courriel de confirmation récapitulant votre
            commande et son numéro. Nous vous tenons informé par e-mail à l'expédition. Si vous
            n'avez rien reçu, vérifiez vos spams, puis écrivez-nous à{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> : on retrouve votre commande
            avec votre nom ou votre adresse e-mail.
          </p>

          <h2>Livraison et retrait</h2>
          <p>
            Nous livrons en France métropolitaine (5 € par commande). Comptez 2 à 3 jours ouvrés
            d'expédition puis 5 à 7 jours ouvrés de livraison pour les produits en stock ; pour les
            précommandes, environ une semaine de fabrication s'ajoute avant l'envoi. Le retrait en
            main propre est aussi possible, gratuitement, dans certaines communes du sud de Nantes :
            le point de rendez-vous est convenu ensuite avec nous. Tous les détails sont dans nos{" "}
            <a href="/cgv">conditions générales de vente</a>.
          </p>

          <h2>Retours et remboursements</h2>
          <p>
            Vous disposez de 14 jours après réception pour changer d'avis, sans avoir à vous
            justifier. Le produit doit nous revenir non porté et non lavé, dans son état d'origine.
            Pour lancer un retour, écrivez-nous à{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> en indiquant votre numéro de
            commande. Le remboursement est effectué sous 14 jours, par le même moyen de paiement.
            La procédure complète (frais de retour, garanties légales) figure dans nos{" "}
            <a href="/cgv">CGV</a>.
          </p>

          <h2>Paiement et sécurité</h2>
          <p>
            Les paiements par carte bancaire sont traités par{" "}
            <a href="https://stripe.com" target="_blank" rel="noopener noreferrer">Stripe</a>, dans
            un environnement sécurisé : nous n'avons jamais accès à votre numéro de carte. En cas de
            problème de paiement (erreur, débit en double, doute sur une transaction), contactez-nous
            à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> et nous vérifierons avec vous.
          </p>

          <h2>Données personnelles</h2>
          <p>
            Pour accéder à vos données, les corriger ou les supprimer, écrivez-nous à{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Le détail de vos droits est
            décrit dans notre <a href="/confidentialite">politique de confidentialité</a>.
          </p>

          <h2>Un litige ?</h2>
          <p>
            En cas de désaccord, contactez-nous d'abord : on trouve presque toujours une solution.
            À défaut, vous pouvez recourir gratuitement à notre médiateur de la consommation, dont
            les coordonnées figurent dans nos <a href="/mentions-legales">mentions légales</a>.
          </p>
        </article>
      </main>
    </div>
  );
}
