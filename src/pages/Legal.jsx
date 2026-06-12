import Logo from "../components/Logo.jsx";
import { CONTACT_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "../lib/contact.js";

/*
 * Pages légales obligatoires pour la vente en ligne :
 *   /mentions-legales   -> doc="mentions"
 *   /cgv                -> doc="cgv"
 *   /confidentialite    -> doc="confidentialite"
 *
 * Textes rédigés sur mesure pour l'association Pleine Lulu (pas de copier-coller).
 * Coordonnées factuelles centralisées ci-dessous pour rester cohérentes entre les
 * trois documents.
 */

const ASSO = {
  nom: "Pleine Lulu",
  forme: "association loi 1901",
  adresse: "49 rue Germaine Dulac, 44830 Bouaye, France",
  rna: "W442028566",
  siret: "92390398300016",
  copresidents: ["Thomas Métais", "Emilien Bottazzo", "Alban Tesson"],
  directeurPublication: "Thomas Métais",
};

const MAJ = "12 juin 2026";

const TABS = [
  { doc: "mentions", path: "/mentions-legales", label: "Mentions légales" },
  { doc: "cgv", path: "/cgv", label: "CGV" },
  { doc: "confidentialite", path: "/confidentialite", label: "Confidentialité" },
];

export default function LegalPage({ doc }) {
  const Body = { mentions: Mentions, cgv: CGV, confidentialite: Confidentialite }[doc] || Mentions;
  const current = TABS.find((t) => t.doc === doc) || TABS[0];

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
        <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {TABS.map((t) => {
            const active = t.doc === current.doc;
            return (
              <a
                key={t.doc}
                href={t.path}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                  padding: "7px 14px",
                  borderRadius: 50,
                  border: "1px solid",
                  borderColor: active ? "#1a1a1a" : "#e5e5e5",
                  background: active ? "#1a1a1a" : "#fff",
                  color: active ? "#fff" : "#555",
                }}
              >
                {t.label}
              </a>
            );
          })}
        </nav>

        <article className="pl-legal">
          <Body />
          <p style={{ marginTop: 40, fontSize: 13, color: "#999" }}>
            Dernière mise à jour : {MAJ}.
          </p>
        </article>
      </main>
    </div>
  );
}

function Title({ children }) {
  return (
    <h1 style={{ fontSize: "clamp(26px, 5vw, 36px)", fontWeight: 900, letterSpacing: -1, marginBottom: 8 }}>
      {children}
    </h1>
  );
}

/* ------------------------------------------------------------------ */
/* 1. MENTIONS LÉGALES                                                 */
/* ------------------------------------------------------------------ */

function Mentions() {
  return (
    <>
      <Title>Mentions légales</Title>
      <p style={{ color: "#777", marginBottom: 28 }}>
        Informations légales relatives à l'éditeur et à l'hébergeur du site, conformément à la
        loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN).
      </p>

      <h2>Éditeur du site</h2>
      <p>Le présent site est édité par :</p>
      <div className="pl-legal-block">
        <p style={{ marginBottom: 0 }}>
          <strong>{ASSO.nom}</strong>, {ASSO.forme}
          <br />
          Siège social : {ASSO.adresse}
          <br />
          Numéro RNA : {ASSO.rna}
          <br />
          Numéro SIRET : {ASSO.siret}
          <br />
          Courriel : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <br />
          Instagram :{" "}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            {INSTAGRAM_HANDLE}
          </a>
        </p>
      </div>
      <p>
        L'association n'est pas assujettie à la TVA et bénéficie de la franchise en base prévue
        à l'article 293 B du Code général des impôts : les prix sont indiqués nets de taxe, avec
        la mention « TVA non applicable, article 293 B du CGI ».
      </p>

      <h2>Représentants légaux et directeur de la publication</h2>
      <p>
        L'association est administrée par trois co-présidents : {ASSO.copresidents.join(", ")}.
        Le directeur de la publication du site est {ASSO.directeurPublication}, en sa qualité de
        co-président.
      </p>

      <h2>Hébergeur</h2>
      <p>Le site est hébergé par :</p>
      <div className="pl-legal-block">
        <p style={{ marginBottom: 0 }}>
          <strong>Netlify, Inc.</strong>
          <br />
          512 2nd Street, Suite 200, San Francisco, CA 94107, États-Unis
          <br />
          Téléphone : +1 415-691-1573
          <br />
          Site : <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer">www.netlify.com</a>
        </p>
      </div>

      <h2>Propriété intellectuelle</h2>
      <p>
        L'ensemble des éléments du site (textes, visuels, logos, photographies, mise en page et
        code) est protégé par le droit de la propriété intellectuelle et demeure la propriété de
        {" "}{ASSO.nom} ou de ses partenaires. Toute reproduction, représentation ou
        réutilisation, totale ou partielle, sans autorisation écrite préalable, est interdite.
      </p>

      <h2>Données personnelles et cookies</h2>
      <p>
        Le traitement des données personnelles collectées via le site, ainsi que l'usage des
        cookies et la façon de modifier vos choix, sont détaillés dans notre{" "}
        <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>Médiation de la consommation</h2>
      <p>
        Conformément aux articles L.612-1 et suivants du Code de la consommation, tout
        consommateur a le droit de recourir gratuitement à un médiateur de la consommation en
        vue de la résolution amiable d'un litige qui l'opposerait à l'association. Pleine Lulu a
        désigné le médiateur suivant :
      </p>
      <div className="pl-legal-block">
        <p style={{ marginBottom: 0 }}>
          <strong>CM2C</strong> (Centre de la Médiation de la Consommation de Conciliateurs de Justice)
          <br />
          49 rue de Ponthieu, 75008 Paris
          <br />
          Téléphone : 01 89 47 00 14
          <br />
          Courriel : <a href="mailto:litiges@cm2c.net">litiges@cm2c.net</a>
          <br />
          Site : <a href="https://www.cm2c.net" target="_blank" rel="noopener noreferrer">www.cm2c.net</a>
        </p>
      </div>
      <p>
        Le recours au médiateur ne peut intervenir qu'après une réclamation écrite préalable
        adressée à l'association et restée sans réponse satisfaisante dans un délai raisonnable.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question relative au site ou à une commande :{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2. CONDITIONS GÉNÉRALES DE VENTE                                    */
/* ------------------------------------------------------------------ */

function CGV() {
  return (
    <>
      <Title>Conditions générales de vente</Title>
      <p style={{ color: "#777", marginBottom: 28 }}>
        Les présentes conditions régissent les ventes conclues sur le site de l'association
        Pleine Lulu. Elles sont susceptibles d'évoluer ; la version applicable est celle en
        vigueur à la date de la commande.
      </p>

      <h2>Article 1 - Objet et champ d'application</h2>
      <p>
        Les présentes conditions générales de vente (CGV) s'appliquent à toute commande de
        produits passée par un consommateur (ci-après « le client ») sur le site de
        l'association {ASSO.nom}, {ASSO.forme} dont le siège est situé {ASSO.adresse}, RNA{" "}
        {ASSO.rna}, SIRET {ASSO.siret} (ci-après « le vendeur » ou « l'association »). Toute
        commande implique l'acceptation pleine et entière des présentes CGV, que le client
        reconnaît avoir lues avant de valider son achat.
      </p>

      <h2>Article 2 - Produits</h2>
      <p>
        L'association vend des t-shirts à son effigie, en coton, imprimés en France. Les
        caractéristiques essentielles de chaque produit (visuel, composition, tailles, couleurs)
        sont présentées sur les fiches produits du site. Certains modèles sont proposés en
        précommande : ils sont fabriqués après la commande, ce qui est indiqué au moment de
        l'achat. Les photographies et illustrations sont les plus fidèles possible mais ne
        sauraient engager le vendeur en cas de légère différence d'aspect ou de teinte.
      </p>

      <h2>Article 3 - Prix</h2>
      <p>
        Les prix sont indiqués en euros, toutes taxes comprises. L'association bénéficiant de la
        franchise en base de TVA (article 293 B du CGI), les prix sont nets de taxe : « TVA non
        applicable, article 293 B du CGI ». Les frais de livraison éventuels sont indiqués
        séparément avant la validation de la commande et s'ajoutent au prix des produits. Les
        prix applicables sont ceux affichés sur le site au moment de la validation de la
        commande.
      </p>

      <h2>Article 4 - Commande</h2>
      <p>
        Le client sélectionne ses produits, les ajoute au panier, puis valide sa commande. La
        vente est considérée comme conclue après confirmation du paiement. Un courriel
        récapitulatif est envoyé au client. L'association se réserve le droit de refuser ou
        d'annuler toute commande en cas de litige antérieur, de motif légitime, ou
        d'indisponibilité d'un produit ; le client en est alors informé et remboursé le cas
        échéant.
      </p>

      <h2>Article 5 - Paiement</h2>
      <p>
        Le paiement s'effectue en ligne par carte bancaire, au moment de la commande, via le
        prestataire de paiement sécurisé Stripe. L'association n'a accès à aucun moment aux
        données complètes de la carte bancaire du client, traitées directement par Stripe dans
        un environnement sécurisé. La commande n'est définitivement enregistrée qu'après
        acceptation du paiement.
      </p>

      <h2>Article 6 - Disponibilité et précommande</h2>
      <p>
        Les produits sont proposés dans la limite des stocks disponibles, mis à jour sur le
        site. Pour les produits en précommande, la fabrication est lancée après la commande et
        nécessite un délai d'environ une semaine avant expédition. En cas d'indisponibilité d'un
        produit après commande, le client est informé dans les meilleurs délais et remboursé de
        la somme correspondante.
      </p>

      <h2>Article 7 - Livraison et retrait</h2>
      <p>
        <strong>Zone de livraison.</strong> Les commandes sont livrées en France métropolitaine
        uniquement. Les frais de livraison s'élèvent à 5 € par commande.
      </p>
      <p>
        <strong>Délais.</strong> Pour les produits en stock, l'expédition intervient sous 2 à 3
        jours ouvrés et la livraison sous 5 à 7 jours ouvrés après la commande. Pour les
        produits en précommande, comptez environ une semaine de fabrication, puis 5 à 7 jours
        ouvrés de livraison. Ces délais sont indicatifs et courent à compter de la confirmation
        de la commande.
      </p>
      <p>
        <strong>Retrait sur place.</strong> Dans certaines communes du sud de Nantes listées sur
        le site, le client peut choisir le retrait en main propre, gratuit. Le point de rendez-vous
        est convenu ensuite avec l'association, notamment via Instagram{" "}
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">{INSTAGRAM_HANDLE}</a>.
      </p>
      <p>
        En cas de retard de livraison anormal, le client est invité à contacter l'association à
        l'adresse <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>Article 8 - Droit de rétractation</h2>
      <p>
        Conformément aux articles L.221-18 et suivants du Code de la consommation, le client
        dispose d'un délai de quatorze (14) jours à compter de la réception du produit pour
        exercer son droit de rétractation, sans avoir à motiver sa décision.
      </p>
      <p>
        Pour exercer ce droit, le client notifie sa décision à l'association par une déclaration
        dénuée d'ambiguïté (courriel à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> ou
        courrier au siège social), par exemple à l'aide du formulaire type ci-dessous. Le produit
        doit être retourné dans son état d'origine, non porté et non lavé, dans les quatorze (14)
        jours suivant la notification, à l'adresse suivante :
      </p>
      <div className="pl-legal-block">
        <p style={{ marginBottom: 0 }}>
          {ASSO.nom}
          <br />
          {ASSO.adresse}
        </p>
      </div>
      <p>
        <strong>Frais de retour.</strong> Les frais directs de renvoi du produit sont à la
        charge du client.
      </p>
      <p>
        <strong>Remboursement.</strong> L'association rembourse le client de la totalité des
        sommes versées, y compris les frais de livraison initiaux (hors frais supplémentaires si
        le client a choisi un mode de livraison plus coûteux que l'option standard), au plus tard
        dans les quatorze (14) jours suivant la date à laquelle elle est informée de la décision
        de rétractation. Le remboursement peut être différé jusqu'à récupération du produit ou
        jusqu'à preuve de son expédition. Il est effectué par le même moyen de paiement que celui
        utilisé pour la commande.
      </p>

      <h3>Formulaire type de rétractation</h3>
      <p>
        (À compléter et renvoyer uniquement si vous souhaitez vous rétracter de la commande.)
      </p>
      <div className="pl-legal-block">
        <p style={{ marginBottom: 0, fontStyle: "italic", color: "#555" }}>
          À l'attention de {ASSO.nom}, {ASSO.adresse}, {CONTACT_EMAIL} :
          <br />
          Je vous notifie par la présente ma rétractation du contrat portant sur la vente du bien
          ci-dessous :
          <br />
          - Commandé le / reçu le : ............
          <br />
          - Numéro de commande : ............
          <br />
          - Nom du client : ............
          <br />
          - Adresse du client : ............
          <br />
          - Date : ............
          <br />
          - Signature (si formulaire papier) : ............
        </p>
      </div>

      <h2>Article 9 - Garanties légales</h2>
      <p>
        Indépendamment de toute garantie commerciale, le vendeur reste tenu des garanties
        légales : la garantie légale de conformité (articles L.217-3 et suivants du Code de la
        consommation) et la garantie contre les vices cachés (articles 1641 et suivants du Code
        civil). Le client peut décider de mettre en oeuvre la garantie de conformité ; il
        bénéficie d'un délai de deux ans à compter de la délivrance du bien et peut choisir entre
        la réparation ou le remplacement, sous réserve des conditions de coût prévues par la loi.
        Pour toute mise en oeuvre de ces garanties, le client contacte l'association à l'adresse{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>Article 10 - Données personnelles</h2>
      <p>
        Les données personnelles collectées dans le cadre d'une commande sont traitées
        conformément à notre <a href="/confidentialite">politique de confidentialité</a>, qui
        précise les finalités, les durées de conservation et les droits du client.
      </p>

      <h2>Article 11 - Médiation et règlement des litiges</h2>
      <p>
        En cas de litige, le client s'adresse en priorité à l'association afin de rechercher une
        solution amiable. À défaut de résolution, et conformément aux articles L.612-1 et
        suivants du Code de la consommation, le client peut recourir gratuitement au médiateur de
        la consommation désigné par l'association :
      </p>
      <div className="pl-legal-block">
        <p style={{ marginBottom: 0 }}>
          <strong>CM2C</strong>
          <br />
          49 rue de Ponthieu, 75008 Paris
          <br />
          Téléphone : 01 89 47 00 14
          <br />
          Courriel : <a href="mailto:litiges@cm2c.net">litiges@cm2c.net</a>
          <br />
          Site : <a href="https://www.cm2c.net" target="_blank" rel="noopener noreferrer">www.cm2c.net</a>
        </p>
      </div>
      <p>
        Les présentes CGV sont soumises au droit français. À défaut de résolution amiable, les
        tribunaux français sont compétents.
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 3. POLITIQUE DE CONFIDENTIALITÉ                                     */
/* ------------------------------------------------------------------ */

function Confidentialite() {
  return (
    <>
      <Title>Politique de confidentialité</Title>
      <p style={{ color: "#777", marginBottom: 28 }}>
        Cette politique explique quelles données personnelles l'association {ASSO.nom} collecte,
        pourquoi, avec qui elles sont partagées, combien de temps elles sont conservées et
        comment exercer vos droits, conformément au Règlement général sur la protection des
        données (RGPD) et à la loi Informatique et Libertés.
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        Le responsable du traitement est l'association {ASSO.nom}, {ASSO.forme}, dont le siège
        est situé {ASSO.adresse} (RNA {ASSO.rna}). Pour toute question relative à vos données :{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>Données collectées</h2>
      <p>Dans le cadre d'une commande, nous collectons :</p>
      <ul>
        <li>vos données d'identité et de contact : nom, prénom, adresse électronique ;</li>
        <li>votre adresse de livraison (ou la commune choisie pour le retrait sur place) ;</li>
        <li>le détail de votre commande (produits, montants, date) ;</li>
        <li>
          les données nécessaires au paiement, traitées directement par notre prestataire
          Stripe : nous ne stockons jamais votre numéro de carte bancaire complet.
        </li>
      </ul>

      <h2>Finalités et bases légales</h2>
      <ul>
        <li>
          <strong>Traiter et suivre vos commandes</strong> (préparation, livraison, service
          après-vente) : exécution du contrat de vente ;
        </li>
        <li>
          <strong>Vous envoyer les courriels liés à la commande</strong> (confirmation, suivi) :
          exécution du contrat ;
        </li>
        <li>
          <strong>Respecter nos obligations comptables et fiscales</strong> (conservation des
          factures) : obligation légale ;
        </li>
        <li>
          <strong>Mesurer l'audience du site</strong> pour l'améliorer (statistiques de
          fréquentation) : votre consentement, recueilli via le bandeau cookies.
        </li>
      </ul>

      <h2>Destinataires et sous-traitants</h2>
      <p>
        Vos données ne sont jamais vendues. Elles sont accessibles aux membres habilités de
        l'association et à nos prestataires techniques (sous-traitants au sens du RGPD), agissant
        sur nos instructions :
      </p>
      <ul>
        <li><strong>Stripe</strong> : traitement des paiements en ligne ;</li>
        <li><strong>Supabase</strong> : base de données (stock et commandes), hébergée en Irlande (Union européenne) ;</li>
        <li><strong>Netlify</strong> : hébergement du site ;</li>
        <li><strong>Resend</strong> : envoi des courriels de confirmation de commande ;</li>
        <li><strong>PostHog</strong> : mesure d'audience, hébergée dans l'Union européenne.</li>
      </ul>

      <h2>Transferts hors Union européenne</h2>
      <p>
        Certains prestataires (Stripe, Netlify, Resend) sont établis aux États-Unis et peuvent
        traiter des données hors de l'Union européenne. Ces transferts sont encadrés par les
        garanties appropriées prévues par le RGPD (clauses contractuelles types de la Commission
        européenne et/ou adhésion au Data Privacy Framework). La base de données (Supabase) et la
        mesure d'audience (PostHog) sont hébergées au sein de l'Union européenne.
      </p>

      <h2>Durées de conservation</h2>
      <ul>
        <li>
          Données de la relation client (identité, commandes) : conservées 3 ans à compter de la
          dernière commande, puis supprimées ou anonymisées ;
        </li>
        <li>
          Pièces comptables (factures) : conservées 10 ans, conformément à l'obligation légale ;
        </li>
        <li>
          Données de mesure d'audience : conservées le temps nécessaire à l'analyse statistique,
          puis supprimées.
        </li>
      </ul>

      <h2>Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement,
        d'opposition, de limitation et de portabilité de vos données. Vous pouvez les exercer à
        tout moment en écrivant à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Si vous
        estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez
        introduire une réclamation auprès de la CNIL (
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>).
      </p>

      <h2>Cookies et traceurs</h2>
      <p>
        Le site utilise un nombre limité de cookies et technologies similaires :
      </p>
      <ul>
        <li>
          <strong>Stockage strictement nécessaire</strong> : la conservation de votre panier et
          de votre choix de consentement utilise le stockage local de votre navigateur. Ce
          stockage est indispensable au fonctionnement du site et ne nécessite pas votre
          consentement.
        </li>
        <li>
          <strong>Mesure d'audience (PostHog)</strong> : déposée uniquement après votre accord,
          pour produire des statistiques de fréquentation. Vous pouvez accepter ou refuser, et
          modifier votre choix à tout moment via le lien « Gérer les cookies » en bas de page.
        </li>
        <li>
          <strong>Paiement (Stripe)</strong> : lors du paiement, Stripe peut déposer ses propres
          cookies sur sa page sécurisée, à des fins de sécurité et de prévention de la fraude.
          Ces cookies relèvent de la politique de confidentialité de Stripe.
        </li>
      </ul>

      <h2>Sécurité</h2>
      <p>
        Nous mettons en oeuvre des mesures techniques et organisationnelles raisonnables pour
        protéger vos données contre tout accès, perte ou divulgation non autorisés. Les paiements
        sont traités par un prestataire spécialisé dans un environnement sécurisé.
      </p>
    </>
  );
}
