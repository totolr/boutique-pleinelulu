import { useState } from "react";
import { useCart } from "../lib/cart.jsx";
import { track } from "../lib/analytics.js";
import { SIZES, COLOR_NAMES, formatPrice, getProductImage } from "../lib/products.js";
import ProductImage from "./ProductImage.jsx";

export default function ProductCard({ product, stock, index }) {
  const { addItem } = useCart();
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState("M");
  const [added, setAdded] = useState(false);

  // stock = { "color-size": quantity } pour CE produit
  const qty = stock?.[`${color}-${size}`];
  const known = qty !== undefined; // a-t-on l'info stock ?
  const isOut = known && qty <= 0;
  const isLow = known && qty > 0 && qty <= 5;

  const stockForSize = (s) => stock?.[`${color}-${s}`];

  const handleAdd = () => {
    if (isOut) return;
    addItem(product, color, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
    track("add_to_cart", {
      product: product.id,
      color: COLOR_NAMES[color],
      size,
      price: product.price,
    });
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid #00000008",
        animation: `slideUp 0.5s ease-out ${index * 0.07}s both`,
      }}
    >
      {/* Visuel */}
      <div
        style={{
          aspectRatio: "1",
          background: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {product.badge && (
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "#EF4135",
              color: "#fff",
              padding: "4px 12px",
              borderRadius: 50,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.3,
            }}
          >
            {product.badge}
          </span>
        )}
        {isOut && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,255,255,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            <span
              style={{
                background: "#1a1a1a",
                color: "#fff",
                padding: "8px 18px",
                borderRadius: 50,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              RUPTURE DE STOCK
            </span>
          </div>
        )}
        <ProductImage
          src={getProductImage(product, color)}
          alt={`${product.name} - ${COLOR_NAMES[color] || color}`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          fallback={
            <svg width="96" height="96" viewBox="0 0 100 100">
              <path
                d="M50 16 L34 34 H16 L22 54 L16 86 H42 L50 70 L58 86 H84 L78 54 L84 34 H66 Z"
                fill={color}
              />
            </svg>
          }
        />
      </div>

      {/* Infos */}
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{product.name}</h3>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>
            {formatPrice(product.price)}
          </span>
        </div>
        <p style={{ color: "#999", fontSize: 13, margin: "4px 0 10px" }}>
          {product.desc}
        </p>

        {/* Indicateur de stock */}
        {known && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: isOut ? "#999" : isLow ? "#d97706" : "#16a34a",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: isOut ? "#ccc" : isLow ? "#f59e0b" : "#22c55e",
              }}
            />
            {isOut
              ? "Rupture de stock"
              : isLow
              ? `Plus que ${qty} en stock !`
              : "En stock"}
          </div>
        )}

        {/* Couleurs */}
        <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
          {product.colors.map((c) => (
            <button
              key={c}
              className="pl-swatch"
              title={COLOR_NAMES[c]}
              onClick={() => setColor(c)}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: c,
                cursor: "pointer",
                border: color === c ? "3px solid #1a1a1a" : "3px solid #e5e5e5",
              }}
            />
          ))}
        </div>

        {/* Tailles */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {SIZES.map((s) => {
            const sQty = stockForSize(s);
            const sOut = sQty !== undefined && sQty <= 0;
            const isActive = size === s && !sOut;
            return (
              <button
                key={s}
                className={`pl-size${isActive ? " pl-size-active" : ""}`}
                onClick={() => !sOut && setSize(s)}
                disabled={sOut}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: sOut ? "not-allowed" : "pointer",
                  border: "2px solid",
                  borderColor: isActive ? "#1a1a1a" : "#e5e5e5",
                  background: sOut ? "#f5f5f5" : isActive ? "#1a1a1a" : "#fff",
                  color: sOut ? "#ccc" : isActive ? "#fff" : "#666",
                  textDecoration: sOut ? "line-through" : "none",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Ajouter au panier */}
        <button
          className={isOut || added ? "" : "pl-btn-add"}
          onClick={handleAdd}
          disabled={isOut}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 50,
            border: "none",
            cursor: isOut ? "not-allowed" : "pointer",
            fontWeight: 700,
            fontSize: 14,
            background: isOut ? "#e5e5e5" : added ? "#16a34a" : "#1a1a1a",
            color: isOut ? "#999" : "#fff",
          }}
        >
          {isOut ? "Indisponible" : added ? "✓ Ajouté !" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}
