import Image from "next/image";
import type { CSSProperties } from "react";

const NATIVE_HEIGHT = 54;
const NATIVE_WIDTH = 301;

export function Logo({
  size = 32,
  variant = "dark",
  priority = false,
  className,
}: {
  /** Height in px (width auto-scales) */
  size?: number;
  /** "dark" = native colors on light bg, "light" = inverted for dark bg, "black" = solid black silhouette */
  variant?: "dark" | "light" | "black";
  priority?: boolean;
  className?: string;
}) {
  const filter =
    variant === "light"
      ? "brightness(0) invert(1)"
      : variant === "black"
        ? "brightness(0)"
        : undefined;
  const width = Math.round((size / NATIVE_HEIGHT) * NATIVE_WIDTH);
  const style: CSSProperties = {
    height: size,
    width: "auto",
    objectFit: "contain",
    display: "block",
    filter,
  };

  return (
    <Image
      src="/brand/klusblok-logo.png"
      alt="Klusblok"
      width={width}
      height={size}
      style={style}
      priority={priority}
      className={className}
    />
  );
}
