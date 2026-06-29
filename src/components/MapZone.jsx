import { useEffect, useRef } from "react";
import zoneData from "../data/zone-communes.json";
import { PICKUP_COMMUNES as COMMUNES } from "../lib/pickup-zones.js";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "../lib/contact.js";

/*
 * Carte interactive de la zone de retrait (sud de Nantes).
 * Leaflet + tuiles OpenStreetMap (gratuit, sans clé). Les "zones" sont les
 * vraies limites administratives des communes, EMBARQUÉES en local dans
 * src/data/zone-communes.json (pas d'appel API externe au chargement : ça
 * marche partout, même hors-ligne). Voir le commentaire en bas pour régénérer.
 *
 * Liste des communes : src/lib/pickup-zones.js (partagée avec le panier).
 */

export default function MapZone() {
  const elRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const L = window.L;
    if (!L || !elRef.current || mapRef.current) return;

    const map = L.map(elRef.current, { scrollWheelZoom: false }).setView([47.13, -1.69], 11);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    const layer = L.geoJSON(zoneData, {
      style: { color: "#EF4135", weight: 2, fillColor: "#EF4135", fillOpacity: 0.2 },
      onEachFeature: (feature, lyr) => {
        const nom = feature.properties?.nom;
        if (!nom) return;
        lyr.bindPopup(`<strong>${nom}</strong>`);
        lyr.bindTooltip(nom, {
          permanent: true,
          direction: "center",
          className: "pl-zone-label",
        });
      },
    }).addTo(map);

    const bounds = layer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <section
      id="zone"
      style={{ background: "#fff", borderTop: "1px solid #00000010", scrollMarginTop: 80 }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#0055A4",
              marginBottom: 12,
            }}
          >
            Retrait sur place
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 900,
              letterSpacing: -1,
              lineHeight: 1.1,
              marginBottom: 14,
            }}
          >
            Près de chez toi, au sud de{" "}
            <span style={{ borderBottom: "4px solid #EF4135", paddingBottom: 2 }}>Nantes</span>
          </h2>
          <p style={{ fontSize: 15, color: "#666", maxWidth: 560, margin: "0 auto", lineHeight: 1.5 }}>
            Tu es dans le coin ? Choisis le retrait sur place au moment de la commande : c'est
            gratuit, et on fixe le point de rendez-vous ensuite sur Instagram,{" "}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0055A4", fontWeight: 700, textDecoration: "none" }}
            >
              {INSTAGRAM_HANDLE}
            </a>
            .
          </p>
        </div>

        <div
          ref={elRef}
          className="pl-map"
          style={{
            height: 400,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid #e5e5e5",
            background: "#eef2f4",
          }}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
            marginTop: 22,
          }}
        >
          {COMMUNES.map((c) => (
            <span
              key={c.name}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1a1a1a",
                background: "#f5f5f5",
                border: "1px solid #e5e5e5",
                borderRadius: 50,
                padding: "6px 14px",
              }}
            >
              {c.name} <span style={{ color: "#999", fontWeight: 500 }}>{c.cp}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/*
 * Régénérer src/data/zone-communes.json (si la liste de communes change) :
 * télécharger le GeoJSON des communes 44 et filtrer. Source :
 * https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements/44-loire-atlantique/communes-44-loire-atlantique.geojson
 * (noms du jeu de données parfois simplifiés : Montagne, Pellerin,
 * Saint-Aignan-Grandlieu -> remappés vers les noms officiels).
 */
