import { useEffect, useId, useRef, useState } from "react";
import { useAnimatedNumber } from "./useAnimatedNumber.js";

export default function BrainBattery({
  score,
  persona,
  interactive = false,
  supercharged = false,
  onTap,
}) {
  const clipId = useId();
  const effectiveScore = supercharged ? 10 : score;
  const pct = Math.round(Math.max(10, Math.min(100, (effectiveScore / 10) * 100)));
  const displayPct = Math.round(useAnimatedNumber(pct, 360));

  const prevPctRef = useRef(pct);
  const [pulseState, setPulseState] = useState(null);

  useEffect(() => {
    const prev = prevPctRef.current;
    prevPctRef.current = pct;
    if (pct === prev) return undefined;

    const nextPulse = pct > prev ? "charging" : "draining";
    setPulseState(nextPulse);
    const ms = nextPulse === "charging" ? 620 : 320;
    const timer = setTimeout(() => setPulseState(null), ms);
    return () => clearTimeout(timer);
  }, [pct]);

  const moodSlug = supercharged
    ? "balanced"
    : persona === "Balanced"
    ? "balanced"
    : persona === "Moderate Risk"
    ? "moderate"
    : "burnout";

  const tone = supercharged
    ? { fill: "#F59E0B", glow: "rgba(245, 158, 11, 0.34)", face: "#111827", label: "شحن توربو" }
    : persona === "Balanced"
    ? { fill: "#10B981", glow: "rgba(16, 185, 129, 0.24)", face: "#064E3B", label: "مشحون" }
    : persona === "Moderate Risk"
    ? { fill: "#F59E0B", glow: "rgba(245, 158, 11, 0.24)", face: "#451A03", label: "بيفصل" }
    : { fill: "#FF5C7A", glow: "rgba(255, 92, 122, 0.28)", face: "#2A0814", label: "البطارية واقعة" };

  const fillHeight = Math.max(14, (pct / 100) * 84);
  const fillY = 108 - fillHeight;
  const showBubbles = supercharged || pulseState === "charging" || persona === "Balanced";

  const widgetClass = [
    "battery-widget",
    `mood-${moodSlug}`,
    pulseState ? `is-${pulseState}` : "",
    interactive ? "is-interactive" : "",
    supercharged ? "is-supercharged" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <svg viewBox="0 0 110 128" className="battery-svg">
        <defs>
          <clipPath id={clipId}>
            <rect x="19" y="22" width="72" height="88" rx="14" />
          </clipPath>
        </defs>

        <rect x="41" y="7" width="28" height="9" rx="4.5" fill="currentColor" fillOpacity="0.38" />

        <rect
          x="15"
          y="18"
          width="80"
          height="96"
          rx="18"
          fill="var(--surface-subtle)"
          stroke="var(--border-hover)"
          strokeWidth="2.5"
        />

        <g clipPath={`url(#${clipId})`}>
          <rect
            x="19"
            y={fillY}
            width="72"
            height={fillHeight + 6}
            fill={tone.fill}
            className="battery-liquid"
          />
          <rect
            x="19"
            y={fillY}
            width="72"
            height="4"
            fill="#FFFFFF"
            fillOpacity="0.35"
            className="battery-liquid"
          />
          {showBubbles && (
            <g fill="#FFFFFF" fillOpacity="0.45">
              <circle cx="34" cy="94" r="2.2" className="battery-bubble b1" />
              <circle cx="56" cy="99" r="2.8" className="battery-bubble b2" />
              <circle cx="76" cy="92" r="2" className="battery-bubble b3" />
            </g>
          )}
        </g>

        {supercharged ? (
          <g className="battery-shades">
            <rect x="29" y="49" width="22" height="14" rx="4" fill="#111827" />
            <rect x="59" y="49" width="22" height="14" rx="4" fill="#111827" />
            <line x1="51" y1="53" x2="59" y2="53" stroke="#111827" strokeWidth="2.8" />
            <line x1="33" y1="53" x2="39" y2="59" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.7" />
            <line x1="63" y1="53" x2="69" y2="59" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.7" />
            <path d="M 43 72 Q 55 83 67 72" stroke="#111827" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <circle cx="84" cy="31" r="2.8" fill="#FEF08A" className="sparkle-dot" />
            <circle cx="27" cy="36" r="2.1" fill="#FEF08A" className="sparkle-dot d2" />
          </g>
        ) : (
          <>
            {persona === "Balanced" && (
              <g stroke={tone.face} strokeWidth="2.8" strokeLinecap="round" fill="none">
                <path d="M 37 58 Q 41 52 45 58" />
                <path d="M 65 58 Q 69 52 73 58" />
                <path d="M 44 71 Q 55 81 66 71" />
                <circle cx="82" cy="34" r="2.4" fill="#FFFFFF" stroke="none" className="sparkle-dot" />
                <circle
                  cx="29"
                  cy="39"
                  r="1.7"
                  fill="#FFFFFF"
                  stroke="none"
                  className="sparkle-dot d2"
                />
              </g>
            )}

            {persona === "Moderate Risk" && (
              <g stroke={tone.face} strokeWidth="2.8" strokeLinecap="round" fill="none">
                <line x1="36" y1="57" x2="46" y2="57" />
                <line x1="64" y1="57" x2="74" y2="57" />
                <line x1="45" y1="73" x2="65" y2="71" />
              </g>
            )}

            {persona === "High Burnout Risk" && (
              <g stroke="#FFF5F7" strokeWidth="2.6" strokeLinecap="round" fill="none">
                <path d="M 36 53 L 44 59 M 44 53 L 36 59" />
                <path d="M 66 53 L 74 59 M 74 53 L 66 59" />
                <path d="M 44 75 Q 55 67 66 75" />
                <path
                  d="M 81 37 C 81 37 85 43 85 46 A 4 4 0 1 1 77 46 C 77 43 81 37 81 37 Z"
                  fill="#93C5FD"
                  stroke="none"
                  className="sweat-drop"
                />
              </g>
            )}
          </>
        )}

        {(pulseState === "charging" || supercharged) && (
          <path
            d="M 57 31 L 47 47 L 54 47 L 52 59 L 63 42 L 56 42 Z"
            fill="#FFFFFF"
            fillOpacity="0.92"
            className="battery-bolt"
          />
        )}
      </svg>
      <div className="battery-caption">
        <span
          className="tabular-readout battery-pct"
          style={{ color: supercharged ? "#D97706" : tone.fill }}
        >
          {displayPct}%
        </span>
        <span
          className="battery-status"
          style={supercharged ? { color: "#D97706", fontWeight: 700 } : undefined}
        >
          {tone.label}
        </span>
      </div>
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        className={widgetClass}
        style={{ "--battery-glow": tone.glow }}
        aria-label={`شحن طاقتك الذهنية ${displayPct}% — اضغط للتجربة`}
        onClick={onTap}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={widgetClass}
      style={{ "--battery-glow": tone.glow }}
      aria-label={`شحن طاقتك الذهنية ${displayPct}%`}
    >
      {content}
    </div>
  );
}
