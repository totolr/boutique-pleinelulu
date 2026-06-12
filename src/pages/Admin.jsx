import { useEffect, useState, useCallback } from "react";
import { supabase, fetchStock } from "../lib/supabase.js";
import { formatPrice, COLOR_NAMES, SIZES, getProduct, getProductImage } from "../lib/products.js";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "../lib/contact.js";
import Logo from "../components/Logo.jsx";
import ProductImage from "../components/ProductImage.jsx";

const STATUS_LABELS = {
  paid: "Payée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_COLORS = {
  paid: { bg: "#dbeafe", fg: "#1e40af" },
  preparing: { bg: "#fef3c7", fg: "#b45309" },
  shipped: { bg: "#e0e7ff", fg: "#4338ca" },
  delivered: { bg: "#dcfce7", fg: "#15803d" },
  cancelled: { bg: "#fee2e2", fg: "#b91c1c" },
};

// Déroulé normal d'une commande (cancelled est un état terminal hors flux).
const STATUS_FLOW = ["paid", "preparing", "shipped", "delivered"];

export default function Admin() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Récupère la session existante + écoute les changements (magic link callback)
  useEffect(() => {
    if (!supabase) {
      setLoadingSession(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return <FatalError message="Supabase n'est pas configuré (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants)." />;
  }
  if (loadingSession) {
    return <CenteredMessage text="Chargement..." />;
  }
  if (!session) {
    return <LoginScreen />;
  }
  return <Dashboard session={session} />;
}

function Dashboard({ session }) {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState({});
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("orders");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");
  const [showStats, setShowStats] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin-orders", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.status === 401 || res.status === 403) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Accès refusé");
        setOrders([]);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erreur ${res.status}`);
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [session.access_token]);

  useEffect(() => {
    fetchOrders();
    fetchStock().then(setStock).catch(() => {});
  }, [fetchOrders]);

  const updateOrder = async (id, patch) => {
    const optimistic = orders.map((o) => (o.id === id ? { ...o, ...patch } : o));
    setOrders(optimistic);
    try {
      const res = await fetch(`/api/admin-orders?id=${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erreur ${res.status}`);
      }
      const data = await res.json();
      setOrders((cur) => cur.map((o) => (o.id === id ? data.order : o)));
      if (data.email?.sent) {
        setNotice({ kind: "ok", text: data.email.type === "pickup" ? "Mail \"prête à retirer\" envoyé au client." : "Mail d'expédition envoyé au client." });
      } else if (data.email?.warning) {
        setNotice({ kind: "warn", text: data.email.warning });
      } else if (data.email?.error) {
        setNotice({ kind: "err", text: `Échec de l'envoi du mail : ${data.email.error}` });
      }
    } catch (e) {
      setError(e.message);
      fetchOrders();
    }
  };

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 7000);
    return () => clearTimeout(t);
  }, [notice]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const q = search.trim().toLowerCase();
  const now = new Date();
  const visible = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (period === "30d" && Date.now() - new Date(o.created_at).getTime() > 30 * 24 * 3600 * 1000) return false;
    if (period === "month") {
      const d = new Date(o.created_at);
      if (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) return false;
    }
    if (q) {
      const hay = `${o.order_number || ""} ${o.customer_email || ""} ${o.customer_name || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <header
        style={{
          background: "#1a1a1a",
          color: "#fff",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo size={32} inverted />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Suivi des commandes</div>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#999" }}>
              <span style={{ color: "#0055A4" }}>●</span> Admin Pleine Lulu <span style={{ color: "#EF4135" }}>●</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#999" }}>{session.user.email}</span>
          <button
            onClick={logout}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid #fff3",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        <KpiBar orders={orders} stock={stock} />

        <ViewToggle view={view} setView={setView} />

        {error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        {notice && (
          <div
            style={{
              background: notice.kind === "ok" ? "#dcfce7" : notice.kind === "warn" ? "#fef3c7" : "#fee2e2",
              color: notice.kind === "ok" ? "#15803d" : notice.kind === "warn" ? "#b45309" : "#b91c1c",
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span>{notice.text}</span>
            <button
              onClick={() => setNotice(null)}
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        )}

        {view === "stock" ? (
          <StockManager session={session} onError={setError} onNotice={setNotice} />
        ) : (
          <>
            <div style={{ marginBottom: 14 }}>
              <button
                onClick={() => setShowStats((v) => !v)}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e5e5",
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#1a1a1a",
                }}
              >
                {showStats ? "Masquer les statistiques" : "Afficher les statistiques"}
              </button>
            </div>

            {showStats && <ChartsPanel orders={orders} />}

            <OrdersToolbar
              search={search}
              setSearch={setSearch}
              period={period}
              setPeriod={setPeriod}
              count={visible.length}
              onExport={() => exportOrdersCsv(visible)}
            />

            <FilterBar filter={filter} setFilter={setFilter} counts={counts} total={orders.length} />

            {loading && orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#999" }}>Chargement...</div>
            ) : visible.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#999", background: "#fff", borderRadius: 12 }}>
                Aucune commande ne correspond à ta recherche.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {visible.map((o) => (
                  <OrderCard key={o.id} order={o} onUpdate={(patch) => updateOrder(o.id, patch)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + "/admin",
          // Empêche la création silencieuse de comptes : seuls les emails déjà créés dans
          // Supabase Dashboard peuvent se connecter. Double protection avec ADMIN_EMAILS serveur.
          shouldCreateUser: false,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi du lien");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 36,
          borderRadius: 14,
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 10px 40px #0000000d",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Logo size={48} />
          <div style={{ marginTop: 10, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#999" }}>
            <span style={{ color: "#0055A4" }}>●</span> Admin <span style={{ color: "#EF4135" }}>●</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>Suivi des commandes</h1>
        </div>

        {sent ? (
          <div
            style={{
              background: "#dcfce7",
              color: "#15803d",
              padding: 16,
              borderRadius: 10,
              fontSize: 14,
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>✉️</div>
            Lien envoyé à <strong>{email}</strong>.
            <div style={{ fontSize: 12, color: "#15803d", marginTop: 8, opacity: 0.8 }}>
              Ouvre ta boîte mail et clique sur le lien pour te connecter.
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 18, lineHeight: 1.5 }}>
              Entre ton email autorisé. Tu recevras un lien de connexion sécurisé, valable une fois.
            </p>

            <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#666", display: "block", marginBottom: 8 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
              placeholder="toi@pleinelulu.fr"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #e5e5e5",
                borderRadius: 8,
                fontSize: 15,
                boxSizing: "border-box",
                marginBottom: 14,
              }}
            />

            {error && (
              <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={sending || !email}
              style={{
                width: "100%",
                background: "#1a1a1a",
                color: "#fff",
                border: "none",
                padding: "12px",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 700,
                cursor: sending || !email ? "not-allowed" : "pointer",
                opacity: sending || !email ? 0.5 : 1,
              }}
            >
              {sending ? "Envoi en cours..." : "Recevoir le lien de connexion"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

function CenteredMessage({ text }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
      {text}
    </div>
  );
}

function FatalError({ message }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fee2e2", color: "#b91c1c", padding: 20, borderRadius: 10, maxWidth: 480, fontSize: 14 }}>
        {message}
      </div>
    </div>
  );
}

function KpiBar({ orders, stock }) {
  // Le CA exclut les commandes annulées. amount_total est en centimes.
  const active = orders.filter((o) => o.status !== "cancelled");
  const caTotal = active.reduce((s, o) => s + (o.amount_total || 0), 0);

  const now = new Date();
  const caMonth = active
    .filter((o) => {
      const d = new Date(o.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((s, o) => s + (o.amount_total || 0), 0);

  const avg = active.length ? caTotal / active.length : 0;
  const toProcess = orders.filter((o) => o.status === "paid" || o.status === "preparing").length;

  // Combos produit/couleur/taille avec stock <= 5 (seuil "stock faible" de la boutique).
  let lowStock = 0;
  for (const pid in stock) {
    for (const k in stock[pid]) {
      if (stock[pid][k] <= 5) lowStock++;
    }
  }

  const cards = [
    { label: "CA ce mois", value: formatPrice(caMonth) },
    { label: "CA total", value: formatPrice(caTotal) },
    { label: "Panier moyen", value: formatPrice(avg) },
    { label: "À traiter", value: toProcess, accent: toProcess > 0 ? "#0055A4" : null },
    { label: "Stock faible", value: lowStock, accent: lowStock > 0 ? "#EF4135" : null },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
        marginBottom: 18,
      }}
    >
      {cards.map((c) => (
        <div key={c.label} style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 3px #00000008" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>
            {c.label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: c.accent || "#1a1a1a", lineHeight: 1 }}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function ViewToggle({ view, setView }) {
  const tab = (key, label) => (
    <button
      onClick={() => setView(key)}
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        border: "1px solid " + (view === key ? "#1a1a1a" : "#e5e5e5"),
        background: view === key ? "#1a1a1a" : "#fff",
        color: view === key ? "#fff" : "#666",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {tab("orders", "Commandes")}
      {tab("stock", "Stock")}
    </div>
  );
}

function OrdersToolbar({ search, setSearch, period, setPeriod, count, onExport }) {
  const ctrl = { padding: "9px 12px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 13 };
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher (n°, email, nom)..."
        style={{ ...ctrl, flex: "1 1 220px" }}
      />
      <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ ...ctrl, background: "#fff", cursor: "pointer" }}>
        <option value="all">Toute période</option>
        <option value="30d">30 derniers jours</option>
        <option value="month">Ce mois</option>
      </select>
      <button
        onClick={onExport}
        disabled={count === 0}
        style={{ ...ctrl, fontWeight: 600, background: "#fff", cursor: count === 0 ? "default" : "pointer", color: count === 0 ? "#bbb" : "#1a1a1a" }}
      >
        Exporter CSV ({count})
      </button>
    </div>
  );
}

function csvCell(v) {
  const s = String(v ?? "");
  // Séparateur = point-virgule (standard FR : laisse la virgule libre pour les
  // décimales). On entoure de guillemets seulement si le champ contient un ; un " ou un saut de ligne.
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportOrdersCsv(orders) {
  const headers = ["Numéro", "Date", "Statut", "Mode", "Email", "Nom", "Montant (€)", "Suivi", "Articles"];
  const rows = orders.map((o) => {
    const items = (Array.isArray(o.items) ? o.items : [])
      .map((it) => {
        const p = getProduct(it.productId);
        return `${p?.name || it.productId} ${COLOR_NAMES[it.color] || it.color}/${it.size} x${it.qty}`;
      })
      .join(" | ");
    const d = new Date(o.created_at);
    const dateStr = `${d.toLocaleDateString("fr-FR")} ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    return [
      o.order_number || `#${o.id}`,
      dateStr,
      STATUS_LABELS[o.status] || o.status,
      o.shipping_method === "pickup" ? "Retrait" : "Livraison",
      o.customer_email || "",
      o.customer_name || "",
      ((o.amount_total || 0) / 100).toFixed(2).replace(".", ","),
      o.tracking_number || "",
      items,
    ];
  });
  const csv = [headers, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");
  // BOM UTF-8 pour que les accents s'affichent correctement.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `commandes-pleine-lulu-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ChartsPanel({ orders }) {
  const active = orders.filter((o) => o.status !== "cancelled");

  // CA des 14 derniers jours
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({ date: d, total: 0 });
  }
  for (const o of active) {
    const d = new Date(o.created_at);
    d.setHours(0, 0, 0, 0);
    const slot = days.find((x) => x.date.getTime() === d.getTime());
    if (slot) slot.total += o.amount_total || 0;
  }
  const maxDay = Math.max(1, ...days.map((d) => d.total));

  // Répartition des ventes par taille / couleur
  const bySize = {};
  const byColor = {};
  for (const o of active) {
    for (const it of Array.isArray(o.items) ? o.items : []) {
      bySize[it.size] = (bySize[it.size] || 0) + it.qty;
      byColor[it.color] = (byColor[it.color] || 0) + it.qty;
    }
  }

  const panel = { background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px #00000008" };
  const title = { fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 12 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
      <div style={panel}>
        <div style={title}>CA des 14 derniers jours</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 90 }}>
          {days.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                title={`${d.date.toLocaleDateString("fr-FR")} : ${formatPrice(d.total)}`}
                style={{
                  width: "100%",
                  height: Math.max(2, (d.total / maxDay) * 78),
                  background: d.total > 0 ? "#1a1a1a" : "#ececec",
                  borderRadius: "4px 4px 0 0",
                }}
              />
              <span style={{ fontSize: 9, color: "#bbb" }}>{d.date.getDate()}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div style={panel}>
          <div style={title}>Ventes par taille</div>
          <Distribution data={SIZES.map((s) => ({ label: s, value: bySize[s] || 0 }))} />
        </div>
        <div style={panel}>
          <div style={title}>Ventes par couleur</div>
          <Distribution
            data={Object.keys(byColor).map((c) => ({ label: COLOR_NAMES[c] || c, value: byColor[c], swatch: c }))}
          />
        </div>
      </div>
    </div>
  );
}

function Distribution({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.every((d) => d.value === 0)) {
    return <div style={{ fontSize: 13, color: "#bbb" }}>Aucune vente pour l'instant.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <span style={{ width: 90, color: "#666", display: "flex", alignItems: "center", gap: 6 }}>
            {d.swatch && <span style={{ width: 12, height: 12, borderRadius: "50%", background: d.swatch, border: "1px solid #e5e5e5" }} />}
            {d.label}
          </span>
          <div style={{ flex: 1, background: "#f0f0f0", borderRadius: 6, height: 16, overflow: "hidden" }}>
            <div style={{ width: `${(d.value / max) * 100}%`, height: "100%", background: "#0055A4" }} />
          </div>
          <span style={{ width: 28, textAlign: "right", fontWeight: 700 }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function StockManager({ session, onError, onNotice }) {
  const [rows, setRows] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin-stock", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      setRows(data.stock || []);
    } catch (e) {
      onError(e.message);
      setRows([]);
    }
  }, [session.access_token, onError]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (row, quantity) => {
    setSavingId(row.id);
    try {
      const res = await fetch(`/api/admin-stock?id=${row.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      setRows((cur) => cur.map((r) => (r.id === row.id ? data.row : r)));
      onNotice({ kind: "ok", text: `Stock mis à jour : ${data.row.color}/${data.row.size} = ${data.row.quantity}` });
    } catch (e) {
      onError(e.message);
      load();
    } finally {
      setSavingId(null);
    }
  };

  if (rows === null) return <div style={{ textAlign: "center", padding: 60, color: "#999" }}>Chargement du stock...</div>;
  if (rows.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#999", background: "#fff", borderRadius: 12 }}>
        Aucune ligne de stock. Ajoute-les dans Supabase (table "stock").
      </div>
    );
  }

  const byProduct = {};
  for (const r of rows) {
    if (!byProduct[r.product_id]) byProduct[r.product_id] = [];
    byProduct[r.product_id].push(r);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {Object.entries(byProduct).map(([pid, list]) => {
        const product = getProduct(pid);
        return (
          <div key={pid} style={{ background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px #00000008" }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>{product?.name || pid}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {list.map((r) => (
                <StockRow key={r.id} row={r} saving={savingId === r.id} onSave={(q) => save(r, q)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StockRow({ row, saving, onSave }) {
  const [qty, setQty] = useState(String(row.quantity));
  useEffect(() => setQty(String(row.quantity)), [row.quantity]);

  const low = row.quantity <= 5;
  const commit = () => {
    const n = parseInt(qty, 10);
    if (!Number.isInteger(n) || n < 0) {
      setQty(String(row.quantity));
      return;
    }
    if (n !== row.quantity) onSave(n);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 16, height: 16, borderRadius: "50%", background: row.color, border: "1px solid #e5e5e5", flexShrink: 0 }} />
      <span style={{ fontSize: 13, flex: 1 }}>{COLOR_NAMES[row.color] || row.color} · Taille {row.size}</span>
      {low && (
        <span style={{ fontSize: 11, fontWeight: 700, color: "#EF4135" }}>
          {row.quantity <= 0 ? "Rupture" : "Stock bas"}
        </span>
      )}
      <input
        type="text"
        inputMode="numeric"
        value={qty}
        onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        disabled={saving}
        style={{
          width: 64,
          padding: "7px 10px",
          border: "1px solid " + (low ? "#fca5a5" : "#e5e5e5"),
          borderRadius: 8,
          fontSize: 13,
          textAlign: "center",
          background: saving ? "#f5f5f5" : "#fff",
        }}
      />
    </div>
  );
}

function FilterBar({ filter, setFilter, counts, total }) {
  const tabs = [
    { key: "all", label: "Toutes", n: total },
    ...Object.keys(STATUS_LABELS).map((k) => ({ key: k, label: STATUS_LABELS[k], n: counts[k] || 0 })),
  ];

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
      {tabs.map((t) => {
        const active = filter === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            style={{
              background: active ? "#1a1a1a" : "#fff",
              color: active ? "#fff" : "#666",
              border: "1px solid " + (active ? "#1a1a1a" : "#e5e5e5"),
              padding: "8px 14px",
              borderRadius: 50,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t.label} <span style={{ opacity: 0.6, marginLeft: 4 }}>{t.n}</span>
          </button>
        );
      })}
    </div>
  );
}

function OrderCard({ order, onUpdate }) {
  const [tracking, setTracking] = useState(order.tracking_number || "");
  const [notes, setNotes] = useState(order.notes || "");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setTracking(order.tracking_number || "");
    setNotes(order.notes || "");
  }, [order.tracking_number, order.notes]);

  const status = order.status || "paid";
  const color = STATUS_COLORS[status] || STATUS_COLORS.paid;
  const items = Array.isArray(order.items) ? order.items : [];
  const isPreorder = items.some((it) => getProduct(it.productId)?.preorder);
  const date = new Date(order.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  const stripeUrl = `https://dashboard.stripe.com/checkout/sessions/${order.stripe_session_id}`;

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px #00000008" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 240px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#1a1a1a", fontFamily: "monospace" }}>
              {order.order_number || `#${order.id}`}
            </span>
            <span
              style={{
                background: color.bg,
                color: color.fg,
                padding: "3px 10px",
                borderRadius: 50,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {STATUS_LABELS[status]}
            </span>
            {isPreorder && (
              <span
                style={{
                  background: "#ede9fe",
                  color: "#6d28d9",
                  padding: "3px 10px",
                  borderRadius: 50,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Précommande
              </span>
            )}
          </div>
          {order.customer_name && (
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{order.customer_name}</div>
          )}
          <div style={{ fontSize: 13, color: "#666" }}>
            {order.customer_email || "email inconnu"} · {date}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>{formatPrice(order.amount_total)}</div>
          {isPreorder && status === "paid" && (
            <button
              onClick={() => onUpdate({ status: "preparing" })}
              style={{
                background: "#16a34a",
                color: "#fff",
                border: "none",
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Valider la précommande
            </button>
          )}
          <select
            value={status}
            onChange={(e) => onUpdate({ status: e.target.value })}
            style={{
              border: "1px solid #e5e5e5",
              padding: "8px 10px",
              borderRadius: 8,
              fontSize: 13,
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              border: "1px solid #e5e5e5",
              background: "#fff",
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 13,
              cursor: "pointer",
              color: "#666",
            }}
          >
            {expanded ? "Replier" : "Détails"}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
          <Timeline status={status} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="pl-admin-grid">
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>
                Articles
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 13, color: "#333" }}>
                {items.map((it, i) => {
                  const p = getProduct(it.productId);
                  return (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
                      <span
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: "#f5f5f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <ProductImage
                          src={getProductImage(p, it.color)}
                          alt={p?.name || it.productId}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          fallback={
                            <span
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                background: it.color,
                                border: "1px solid #e5e5e5",
                              }}
                            />
                          }
                        />
                      </span>
                      <span>
                        <strong>{p?.name || it.productId}</strong> · {COLOR_NAMES[it.color] || it.color} · {it.size} · x{it.qty}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#999", margin: "16px 0 8px" }}>
                {order.shipping_method === "pickup" ? "Retrait sur place" : "Livraison"}
              </div>
              <DeliveryBlock order={order} />

              <a
                href={stripeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 12,
                  fontSize: 12,
                  color: "#0055A4",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Voir sur Stripe (facture) →
              </a>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>
                N° de suivi colis
              </div>
              <input
                type="text"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                onBlur={() => {
                  if ((order.tracking_number || "") !== tracking) onUpdate({ tracking_number: tracking });
                }}
                placeholder="Coller le n° La Poste / Chronopost..."
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #e5e5e5",
                  borderRadius: 8,
                  fontSize: 13,
                  boxSizing: "border-box",
                  marginBottom: 14,
                }}
              />

              {order.shipped_email_sent_at && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>
                    Mail client
                  </div>
                  <button
                    onClick={() => {
                      const label = order.shipping_method === "pickup" ? "retrait" : "suivi d'expédition";
                      if (window.confirm(`Renvoyer le mail de ${label} à ${order.customer_email || "ce client"} ?`)) {
                        onUpdate({ resendShippingEmail: true });
                      }
                    }}
                    style={{
                      border: "1px solid #e5e5e5",
                      background: "#fff",
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "#1a1a1a",
                    }}
                  >
                    Renvoyer le mail
                  </button>
                  <p style={{ color: "#aaa", fontSize: 11, marginTop: 6 }}>
                    Dernier envoi : {new Date(order.shipped_email_sent_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
              )}

              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>
                Notes internes
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => {
                  if ((order.notes || "") !== notes) onUpdate({ notes });
                }}
                rows={3}
                placeholder="Remarques pour l'équipe..."
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #e5e5e5",
                  borderRadius: 8,
                  fontSize: 13,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Timeline({ status }) {
  if (status === "cancelled") {
    return (
      <div
        style={{
          background: STATUS_COLORS.cancelled.bg,
          color: STATUS_COLORS.cancelled.fg,
          padding: "10px 14px",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        Commande annulée
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(status);

  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
      {STATUS_FLOW.map((s, i) => {
        const done = i <= currentIdx;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STATUS_FLOW.length - 1 ? 1 : "0 0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: done ? "#1a1a1a" : "#fff",
                  border: done ? "1px solid #1a1a1a" : "1px solid #d4d4d4",
                  color: done ? "#fff" : "#bbb",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: done ? "#1a1a1a" : "#bbb", whiteSpace: "nowrap" }}>
                {STATUS_LABELS[s]}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: "0 6px", marginBottom: 16, background: i < currentIdx ? "#1a1a1a" : "#e5e5e5" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function AddressLines({ addr }) {
  if (!addr) return null;
  return (
    <>
      {addr.line1 && <div>{addr.line1}</div>}
      {addr.line2 && <div>{addr.line2}</div>}
      <div>{[addr.postal_code, addr.city].filter(Boolean).join(" ")}</div>
      {addr.country && <div>{addr.country}</div>}
    </>
  );
}

function DeliveryBlock({ order }) {
  const cell = { fontSize: 13, color: "#333", lineHeight: 1.5 };
  const subtitle = { fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", margin: "10px 0 4px" };
  const billing = order.billing_address;

  if (order.shipping_method === "pickup") {
    return (
      <div style={cell}>
        <div>
          Retrait sur place · le client cale le RDV via Instagram,{" "}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0055A4", fontWeight: 600, textDecoration: "none" }}
          >
            {INSTAGRAM_HANDLE}
          </a>
          .
        </div>
        {billing && (
          <>
            <div style={subtitle}>Facturation</div>
            {order.customer_name && <div style={{ fontWeight: 700 }}>{order.customer_name}</div>}
            <AddressLines addr={billing} />
          </>
        )}
      </div>
    );
  }

  const sa = order.shipping_address;
  const addr = sa?.address;
  if (!addr) {
    return <div style={{ ...cell, color: "#999" }}>Adresse non enregistrée (voir sur Stripe).</div>;
  }

  return (
    <div style={cell}>
      {sa.name && <div style={{ fontWeight: 700 }}>{sa.name}</div>}
      <AddressLines addr={addr} />
    </div>
  );
}
