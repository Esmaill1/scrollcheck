import { useEffect, useRef, useState } from "react";

/** Smoothly tweens a numeric value using cubic ease-out while respecting reduced motion. */
export function useAnimatedNumber(target, duration = 340) {
  const safeTarget = Number.isFinite(target) ? target : 0;
  const [display, setDisplay] = useState(safeTarget);
  const currentRef = useRef(safeTarget);
  const rafRef = useRef(null);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !Number.isFinite(target)) {
      currentRef.current = safeTarget;
      setDisplay(safeTarget);
      return undefined;
    }

    const from = currentRef.current;
    if (Math.abs(safeTarget - from) < 0.001) {
      currentRef.current = safeTarget;
      setDisplay(safeTarget);
      return undefined;
    }

    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (safeTarget - from) * eased;
      currentRef.current = next;
      setDisplay(next);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        currentRef.current = safeTarget;
        setDisplay(safeTarget);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [safeTarget, target, duration]);

  return display;
}
