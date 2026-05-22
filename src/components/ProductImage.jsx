import { useState, useEffect } from "react";

// Affiche une photo produit, avec repli automatique (fallback) si le chemin
// est absent OU si le fichier est introuvable (erreur de chargement).
export default function ProductImage({ src, alt, style, className, fallback = null }) {
  const [error, setError] = useState(false);

  // Nouvelle source (ex: changement de couleur) -> on retente le chargement.
  useEffect(() => setError(false), [src]);

  if (!src || error) return fallback;

  return (
    <img
      src={src}
      alt={alt || ""}
      className={className}
      style={style}
      onError={() => setError(true)}
    />
  );
}
