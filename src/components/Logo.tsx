import type { CSSProperties } from "react";

export function Logo({
  size = 32,
  variant = "dark",
}: {
  /** Height in px (width auto-scales) */
  size?: number;
  /** "dark" = native colors on light bg, "light" = inverted for dark bg, "black" = solid black silhouette */
  variant?: "dark" | "light" | "black";
}) {
  const filter =
    variant === "light"
      ? "brightness(0) invert(1)"
      : variant === "black"
        ? "brightness(0)"
        : undefined;
  const style: CSSProperties = {
    height: size,
    width: "auto",
    objectFit: "contain",
    display: "block",
    filter,
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/klusblok-logo.png"
      alt="Klusblok"
      style={style}
    />
  );
}
