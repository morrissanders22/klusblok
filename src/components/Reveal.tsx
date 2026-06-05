"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type Direction = "up" | "left" | "right" | "fade";

const transforms: Record<Direction, string> = {
  up: "translateY(32px)",
  left: "translateX(-32px)",
  right: "translateX(32px)",
  fade: "none",
};

/**
 * Wraps children with a scroll-triggered fade/translate animation.
 *
 * Use `eager` for above-the-fold content: the wrapper renders fully visible
 * from SSR (no JS-blocking opacity:0) which is critical for LCP. Below-fold
 * content can keep the default IntersectionObserver behavior.
 */
export function Reveal({
  children,
  delay = 0,
  dir = "up",
  style = {},
  eager = false,
}: {
  children: ReactNode;
  delay?: number;
  dir?: Direction;
  style?: CSSProperties;
  eager?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [eager]);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[dir],
        transition: eager
          ? undefined
          : `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(.22,.68,0,1.1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
