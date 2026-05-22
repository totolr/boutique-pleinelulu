export default function Logo({ size = 40, inverted = false, alt = "Pleine Lulu" }) {
  const src = inverted ? "/logo-symbole-white.png" : "/logo-symbole.png";
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}
