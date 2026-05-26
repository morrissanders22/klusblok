import type { CSSProperties } from "react";

export function Logo({
  size = 32,
  variant = "dark",
}: {
  /** Height in px (width auto-scales) */
  size?: number;
  /** "dark" = native colors on light bg, "light" = inverted for dark bg */
  variant?: "dark" | "light";
}) {
  const style: CSSProperties = {
    height: size,
    width: "auto",
    objectFit: "contain",
    display: "block",
    filter: variant === "light" ? "brightness(0) invert(1)" : undefined,
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
