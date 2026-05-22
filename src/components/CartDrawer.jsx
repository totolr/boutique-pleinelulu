import { useState } from "react";
import { useCart } from "../lib/cart.jsx";
import { track } from "../lib/analytics.js";
import { COLOR_NAMES, formatPrice, getProduct, getProductImage } from "../lib/products.js";
import ProductImage from "./ProductImage.jsx";

export default function CartDrawer() {
  const { items, open, setOpen, changeQty, removeItem, total, count } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stockErrors, setStockErrors] = useState([]);
  const [shippingMethod, setShippingMethod] = useState("delivery");
  const [postalCode, setPostalCode] = useState("");

  if (!open) return null;

  const checkout = async () => {
    setError(null);
    setStockErrors([]);

    if (shippingMethod === "pickup" && !/^\d{5}$/.test(postalCode.trim())) {
      setError("Entre un code postal valide (5 chiffres) pour le retrait sur place.");
      return;
    }

    setLoading(true);
    track("checkout_started", { total, items: count, shippingMethod });

    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            color: i.color,
            size: i.size,
            qty: i.qty,
          })),
          shippingMethod,
          postalCode: shippingMethod === "pickup" ? postalCode.trim() : undefined,
        }),
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          `Réponse serveur invalide (HTTP ${res.status}). Vérifie le terminal netlify dev.`
        );
      }

      if (res.status === 409 && data.details) {
        setStockErrors(data.details);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || `Erreur ${res.status} : ${raw.slice(0, 120) || "réponse vide"}`);
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "#00000055",
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          width: "min(420px, 100%)",
          background: "#fff",
          height: "100%",
          padding: 26,
          display: "flex",
          flexDirection: "column",
          animation: "slideIn 0.25s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Ton panier</h2>
          <button
            onClick={() => setOpen(false)}
            style={{
              border: "none",
              background: "#f0f0f0",
              width: 34,
              height: 34,
              borderRadius: 9,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#aaa",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 10 }}>🛒</div>
            Panier vide
          </div>
        ) : (
          <>
            {/* Liste articles */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {items.map((i) => (
                <div
                  key={i.key}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "14px 0",
                    borderBottom: "1px solid #f0f0f0",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 10,
                      background: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    <ProductImage
                      src={getProductImage(getProduct(i.productId), i.color)}
                      alt={i.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      fallback={
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: i.color,
                            border: "1px solid #e5e5e5",
                          }}
                        />
                      }
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{i.name}</div>
                    <div style={{ fontSize: 12, color: "#999" }}>
                      {COLOR_NAMES[i.color]} · {i.size}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <button onClick={() => changeQty(i.key, -1)} style={qtyBtn}>−</button>
                    <span style={{ fontWeight: 600, fontSize: 14, minWidth: 16, textAlign: "center" }}>
                      {i.qty}
                    </span>
                    <button onClick={() => changeQty(i.key, 1)} style={qtyBtn}>+</button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, minWidth: 52, textAlign: "right" }}>
                    {formatPrice(i.price * i.qty)}
                  </div>
                  <button
                    onClick={() => removeItem(i.key)}
                    style={{ border: "none", background: "none", cursor: "pointer", color: "#ccc", fontSize: 16 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Erreurs */}
            {error && (
              <div style={{ background: "#fef2f2", color: "#dc2626", padding: 12, borderRadius: 10, fontSize: 13, marginTop: 12 }}>
                ⚠️ {error}
              </div>
            )}
            {stockErrors.length > 0 && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: 14, borderRadius: 10, marginTop: 12 }}>
                <div style={{ fontWeight: 600, color: "#b45309", fontSize: 13, marginBottom: 6 }}>
                  Stock insuffisant :
                </div>
                <ul style={{ color: "#92400e", fontSize: 12, paddingLeft: 16 }}>
                  {stockErrors.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mode de livraison */}
            <div style={{ paddingTop: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#999", marginBottom: 10 }}>
                Mode de réception
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => { setShippingMethod("delivery"); setError(null); }}
                  style={shippingMethod === "delivery" ? modeBtnActive : modeBtn}
                >
                  Livraison
                  <span style={{ display: "block", fontSize: 11, fontWeight: 500, opacity: 0.8 }}>+5€ · à domicile</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShippingMethod("pickup"); setError(null); }}
                  style={shippingMethod === "pickup" ? modeBtnActive : modeBtn}
                >
                  Retrait sur place
                  <span style={{ display: "block", fontSize: 11, fontWeight: 500, opacity: 0.8 }}>gratuit · RDV via Insta</span>
                </button>
              </div>

              {shippingMethod === "pickup" && (
                <div style={{ marginTop: 12 }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={postalCode}
                    onChange={(e) => { setPostalCode(e.target.value.replace(/\D/g, "")); setError(null); }}
                    placeholder="Ton code postal"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                      fontSize: 14,
                      boxSizing: "border-box",
                    }}
                  />
                  <p style={{ color: "#aaa", fontSize: 11, marginTop: 6 }}>
                    Le retrait n'est dispo que dans certaines zones. On cale le point de RDV ensuite sur Instagram.
                  </p>
                </div>
              )}
            </div>

            {/* Total + checkout */}
            <div style={{ paddingTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>
                  Total
                  <span style={{ display: "block", fontWeight: 500, fontSize: 11, color: "#aaa" }}>
                    {shippingMethod === "delivery" ? "hors livraison (+5€)" : "retrait gratuit"}
                  </span>
                </span>
                <span style={{ fontWeight: 800, fontSize: 24, color: "#1a1a1a" }}>
                  {formatPrice(total)}
                </span>
              </div>
              <button
                className={loading ? "" : "pl-btn-primary"}
                onClick={checkout}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: 50,
                  border: "none",
                  background: loading ? "#ccc" : "#1a1a1a",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: loading ? "default" : "pointer",
                }}
              >
                {loading ? "Redirection..." : "🔒 Payer avec Stripe"}
              </button>
              <p style={{ textAlign: "center", color: "#aaa", fontSize: 11, marginTop: 10 }}>
                Paiement sécurisé · CB, Apple Pay, Google Pay
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const qtyBtn = {
  width: 26,
  height: 26,
  borderRadius: 7,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
};

const modeBtn = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  color: "#1a1a1a",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
  textAlign: "center",
  lineHeight: 1.3,
};

const modeBtnActive = {
  ...modeBtn,
  border: "1px solid #1a1a1a",
  background: "#1a1a1a",
  color: "#fff",
};
