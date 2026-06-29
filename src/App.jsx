import { useState, useEffect } from "react";
import { CartProvider, useCart } from "./lib/cart.jsx";
import { fetchStock } from "./lib/supabase.js";
import { track } from "./lib/analytics.js";
import { PRODUCTS } from "./lib/products.js";
import Logo from "./components/Logo.jsx";
import ProductCard from "./components/ProductCard.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import Carousel from "./components/Carousel.jsx";
import MapZone from "./components/MapZone.jsx";
import CookieBanner from "./components/CookieBanner.jsx";
import SocialLinks from "./components/SocialLinks.jsx";
import Admin from "./pages/Admin.jsx";
import LegalPage from "./pages/Legal.jsx";
import SupportPage from "./pages/Support.jsx";

function Nav() {
  const { count, setOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #00000010",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <a href="#top" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", color: "inherit" }}>
          <Logo size={40} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Pleine Lulu</div>
            <div
              style={{
                fontSize: 10,
                color: "#0055A4",
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              Asso sportive
            </div>
          </div>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <a href="#boutique" className="pl-nav-link">Boutique</a>
          <a href="#apropos" className="pl-nav-link">À propos</a>
          <a href="#zone" className="pl-nav-link">Retrait</a>
          <button
            className="pl-burger"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              border: "none",
              background: "transparent",
              color: "#1a1a1a",
              width: 40,
              height: 40,
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 22,
              lineHeight: 1,
            }}
          >
            ☰
          </button>
          <button
            className="pl-cart-icon"
            aria-label="Panier"
            onClick={() => {
              setOpen(true);
              track("open_cart");
            }}
            style={{
              position: "relative",
              border: "none",
              background: "#1a1a1a",
              color: "#fff",
              width: 44,
              height: 44,
              borderRadius: 12,
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            🛒
            {count > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "#EF4135",
                  color: "#fff",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "pop 0.3s",
                }}
              >
                {count}
              </span>
            )}
          </button>
        </div>
        {menuOpen && (
          <div
            className="pl-mobile-menu"
            style={{
              position: "absolute",
              top: 64,
              right: 24,
              background: "#fff",
              border: "1px solid #00000012",
              borderRadius: 12,
              boxShadow: "0 10px 30px #00000018",
              padding: 8,
              display: "flex",
              flexDirection: "column",
              minWidth: 160,
              zIndex: 60,
            }}
          >
            <a href="#boutique" className="pl-mobile-link" onClick={() => setMenuOpen(false)}>
              Boutique
            </a>
            <a href="#apropos" className="pl-mobile-link" onClick={() => setMenuOpen(false)}>
              À propos
            </a>
            <a href="#zone" className="pl-mobile-link" onClick={() => setMenuOpen(false)}>
              Retrait
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}

function About() {
  const stats = [
    { value: "3", label: "années d'existence" },
    { value: "4", label: "produits en vente" },
  ];

  const blocks = [
    {
      eyebrow: "Pourquoi on existe",
      title: "Notre histoire",
      text: "Pleine Lulu, ça fait trois ans. On est juste trois à essayer de faire vivre un truc autour du football dans les quartiers populaires : des événements sur le terrain, et une boutique qui finance tout ça.",
      variant: "flag",
      reversed: false,
    },
    {
      eyebrow: "Notre but",
      title: "Sport pour tous",
      text: "100% des bénéfices de la boutique sont reversés à nos activités. L'objectif : permettre au plus grand nombre de jouer au foot, sans barrière financière.",
      variant: "dark",
      reversed: true,
    },
    {
      eyebrow: "Et après ?",
      title: "On continue",
      text: "Nos t-shirts sont en précommande : Coupe du Monde, Tricolore, Les Bleus, Nantes FC. Plus on vend, plus on organise d'événements dans les quartiers. La suite dépend de vous.",
      variant: "light",
      reversed: false,
    },
  ];

  return (
    <section id="apropos" style={{ background: "#fff", borderTop: "1px solid #00000010" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#0055A4", marginBottom: 12 }}>
            L'association
          </p>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, marginBottom: 14 }}>
            Pleine Lulu, asso sportive{" "}
            <span style={{ borderBottom: "4px solid #EF4135", paddingBottom: 2 }}>loi 1901</span>
          </h2>
          <p style={{ fontSize: 15, color: "#666", maxWidth: 600, margin: "0 auto", lineHeight: 1.5 }}>
            Notre objectif est simple, promouvoir la pratique du football dans les quartiers populaires, en transmettant notre passion pour le football grâce à des évènements !
          </p>
        </div>

        <div
          style={{
            display: "flex",
            borderTop: "1px solid #e5e5e5",
            borderBottom: "1px solid #e5e5e5",
            padding: "22px 0",
            marginBottom: 64,
            flexWrap: "wrap",
          }}
        >
          {stats.map((s, i) => (
            <div key={s.label} style={{ flex: 1, minWidth: 110, textAlign: "center", padding: "0 12px", borderLeft: i > 0 ? "1px solid #e5e5e5" : "none" }}>
              <div style={{ fontSize: 36, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
          {blocks.map((b, i) => (
            <AboutBlock key={b.title} {...b} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutBlock({ eyebrow, title, text, variant, reversed, index }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 40,
        alignItems: "center",
        animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
      }}
      className="pl-about-row"
    >
      <div style={{ order: reversed ? 2 : 1 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#999", marginBottom: 10 }}>
          {eyebrow}
        </p>
        <h3 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 12 }}>
          {title}
        </h3>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.6 }}>{text}</p>
      </div>
      <AboutVisual variant={variant} order={reversed ? 1 : 2} />
    </div>
  );
}

// Photos "Sport pour tous" : déposer dans public/photos/ (sport-pour-tous-1.webp, -2...).
// Tant qu'aucune n'existe, le visuel graphique de repli s'affiche.
const SPORT_PHOTOS = [
  "/photos/sport-pour-tous-1.webp",
  "/photos/sport-pour-tous-2.webp",
  "/photos/sport-pour-tous-3.webp",
  "/photos/sport-pour-tous-4.webp",
  "/photos/sport-pour-tous-5.webp",
  "/photos/sport-pour-tous-6.webp",
];

function AboutVisual({ variant, order }) {
  const box = {
    aspectRatio: "4 / 3",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    background: "#f5f5f5",
    order,
  };

  // "Notre histoire" : photo de l'équipe (public/photos/equipe.webp) ou drapeau.
  if (variant === "flag") {
    return (
      <div style={box}>
        <Carousel
          candidates={["/photos/equipe.webp"]}
          alt="L'équipe Pleine Lulu"
          fallback={<FlagGraphic />}
        />
      </div>
    );
  }
  // "Sport pour tous" : carrousel de photos de jeunes footballeurs ou repli sombre.
  if (variant === "dark") {
    return (
      <div style={box}>
        <Carousel
          candidates={SPORT_PHOTOS}
          alt="Jeunes footballeurs Pleine Lulu"
          fallback={<DarkGraphic />}
        />
      </div>
    );
  }
  return (
    <div style={box}>
      <LightGraphic />
    </div>
  );
}

function FlagGraphic() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      <div style={{ flex: 1, background: "#0055A4" }} />
      <div style={{ flex: 1, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src="/logo-symbole.png" alt="" width={72} height={72} style={{ objectFit: "contain" }} />
      </div>
      <div style={{ flex: 1, background: "#EF4135" }} />
    </div>
  );
}

function DarkGraphic() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img src="/logo-symbole-white.png" alt="" width={72} height={72} style={{ objectFit: "contain" }} />
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#fff", letterSpacing: 4 }}>
        SPORT POUR TOUS
      </div>
    </div>
  );
}

function LightGraphic() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img src="/logo-symbole.png" alt="" width={64} height={64} style={{ objectFit: "contain" }} />
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "#1a1a1a",
          background: "#fff",
          border: "1px solid #e5e5e5",
          padding: "5px 12px",
          borderRadius: 50,
        }}
      >
        Précommande ouverte
      </span>
    </div>
  );
}

function Banner({ type, onClose }) {
  if (!type) return null;
  const isSuccess = type === "success";
  const color = isSuccess ? "#15803d" : "#b45309";
  return (
    <div
      style={{
        position: "relative",
        background: isSuccess ? "#dcfce7" : "#fef3c7",
        color,
        padding: "14px 48px",
        textAlign: "center",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {isSuccess
        ? "🎉 Merci pour ta précommande ! Un email de confirmation arrive."
        : "Paiement annulé, ton panier est conservé."}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer ce message"
        style={{
          position: "absolute",
          top: "50%",
          right: 12,
          transform: "translateY(-50%)",
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "none",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          color,
          fontSize: 20,
          lineHeight: 1,
          opacity: 0.65,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.65")}
      >
        ×
      </button>
    </div>
  );
}

function Shop() {
  const [stock, setStock] = useState({});
  const [banner, setBanner] = useState(null);
  const { clear } = useCart();

  // Bannière succès/annulation depuis l'URL (retour de Stripe)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      setBanner("success");
      clear(); // vide le panier après paiement réussi
      track("purchase_completed");
      window.history.replaceState({}, "", "/");
    } else if (params.get("canceled")) {
      setBanner("canceled");
      window.history.replaceState({}, "", "/");
    }
  }, [clear]);

  // Chargement du stock depuis Supabase + rafraîchissement /30s
  useEffect(() => {
    let active = true;
    const load = () =>
      fetchStock().then((s) => {
        if (active) setStock(s);
      });
    load();
    const interval = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <Nav />
      <Banner type={banner} onClose={() => setBanner(null)} />

      {/* Hero */}
      <header
        id="top"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "30px 24px 30px",
          textAlign: "center",
          scrollMarginTop: 80,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#1a1a1a",
            color: "#fff",
            padding: "7px 16px",
            borderRadius: 50,
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 22,
          }}
        >
          🏃 Précommande ouverte · chaque achat finance le sport
        </div>
        <h1
          style={{
            fontSize: "clamp(34px, 6vw, 58px)",
            fontWeight: 900,
            letterSpacing: -1.5,
            lineHeight: 1.05,
            marginBottom: 16,
          }}
        >
          Pleine{" "}
          <span
            style={{
              borderBottom: "4px solid #EF4135",
              paddingBottom: 2,
            }}
          >
            Lulu
          </span>
        </h1>
        <p style={{ color: "#666", fontSize: 17, maxWidth: 480, margin: "0 auto" }}>
          T-shirts de l'asso. 100% des bénéfices
          reversés aux activités sportives.
        </p>
      </header>

      {/* Bandeau défilant */}
      <div style={{ background: "#1a1a1a", padding: "12px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", animation: "marquee 20s linear infinite" }}>
          {[0, 1, 2].map((k) => (
            <span
              key={k}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 15,
                color: "#fff",
                letterSpacing: 3,
                marginRight: 50,
              }}
            >
              <span style={{ color: "#0055A4" }}>★</span> 100% COTON{" "}
              <span style={{ color: "#fff" }}>★</span> IMPRIMÉ EN FRANCE{" "}
              <span style={{ color: "#EF4135" }}>★</span> PRÉCOMMANDE OUVERTE{" "}
              <span style={{ color: "#0055A4" }}>★</span> TSHIRT ASSOCIATIF{" "}
              <span style={{ color: "#EF4135" }}>★</span> SPORT POUR TOUS &nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Grille produits */}
      <main id="boutique" style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 24px 80px", scrollMarginTop: 80 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 360px))",
            gap: 22,
            justifyContent: "center",
          }}
        >
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.id} product={p} stock={stock[p.id]} index={i} />
          ))}
        </div>
      </main>

      <About />

      <MapZone />

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #00000010",
          padding: "32px 24px",
          textAlign: "center",
          color: "#999",
          fontSize: 13,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Logo size={26} inverted />
          <strong style={{ color: "#1a1a1a" }}>Pleine Lulu</strong>
        </div>
        Association loi 1901 · contact@pleinelulu.fr
        <br />
        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            justifyContent: "center",
            margin: "12px 0 8px",
          }}
        >
          <a href="/aide" className="pl-footer-link">Aide & contact</a>
          <a href="/mentions-legales" className="pl-footer-link">Mentions légales</a>
          <a href="/cgv" className="pl-footer-link">CGV</a>
          <a href="/confidentialite" className="pl-footer-link">Confidentialité</a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("pl-open-cookie-prefs"))}
            className="pl-footer-link"
            style={{ border: "none", background: "none", cursor: "pointer", font: "inherit", padding: 0 }}
          >
            Gérer les cookies
          </button>
        </nav>
        <SocialLinks size={19} />
        <span style={{ display: "block", marginTop: 12, fontSize: 11 }}>
          © {new Date().getFullYear()} · Tous droits réservés
        </span>
      </footer>

      <CartDrawer />
    </>
  );
}

export default function App() {
  // Routage minimal sur le pathname (pas de react-router pour quelques pages)
  const path = typeof window !== "undefined" ? window.location.pathname : "/";

  if (path.startsWith("/admin")) {
    return <Admin />;
  }

  let page;
  if (path.startsWith("/aide")) page = <SupportPage />;
  else if (path.startsWith("/mentions-legales")) page = <LegalPage doc="mentions" />;
  else if (path.startsWith("/cgv")) page = <LegalPage doc="cgv" />;
  else if (path.startsWith("/confidentialite")) page = <LegalPage doc="confidentialite" />;
  else
    page = (
      <CartProvider>
        <Shop />
      </CartProvider>
    );

  return (
    <>
      {page}
      <CookieBanner />
    </>
  );
}
