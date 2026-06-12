import { useState, useEffect } from "react";

/*
 * Carrousel d'images robuste : on probe chaque chemin et on ne garde que les
 * fichiers réellement présents. Tant qu'aucune photo n'existe (ex : avant
 * l'upload), on affiche "fallback". Dès qu'une image est déposée dans public/,
 * elle apparaît sans toucher au code.
 *
 * Le parent doit être positionné (position: relative) et définir la taille
 * (aspectRatio ou height) : le carrousel le remplit en absolute inset:0.
 */
export default function Carousel({ candidates = [], alt = "", fallback = null }) {
  const [loaded, setLoaded] = useState(null); // null = détection en cours
  const [idx, setIdx] = useState(0);
  const key = candidates.filter(Boolean).join("|");

  useEffect(() => {
    let active = true;
    const list = candidates.filter(Boolean);
    if (list.length === 0) {
      setLoaded([]);
      return;
    }
    Promise.all(
      list.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => resolve(null);
            img.src = src;
          })
      )
    ).then((res) => {
      if (active) {
        setLoaded(res.filter(Boolean));
        setIdx(0);
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const fill = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (loaded === null || loaded.length === 0) {
    return <div style={fill}>{fallback}</div>;
  }

  const count = loaded.length;
  const go = (e, d) => {
    e.stopPropagation();
    setIdx((i) => (i + d + count) % count);
  };

  return (
    <div style={fill}>
      <img
        src={loaded[idx]}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {count > 1 && (
        <>
          <button
            type="button"
            className="pl-carousel-arrow pl-carousel-prev"
            aria-label="Photo précédente"
            onClick={(e) => go(e, -1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="pl-carousel-arrow pl-carousel-next"
            aria-label="Photo suivante"
            onClick={(e) => go(e, 1)}
          >
            ›
          </button>
          <div className="pl-carousel-dots">
            {loaded.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Photo ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx(i);
                }}
                className={"pl-carousel-dot" + (i === idx ? " is-active" : "")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
