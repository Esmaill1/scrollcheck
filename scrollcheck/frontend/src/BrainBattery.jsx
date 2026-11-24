export default function BrainBattery({ score, persona }) {
  const pct = Math.round(Math.max(10, Math.min(100, (score / 10) * 100)));

  const tone =
    persona === "Balanced"
      ? { fill: "#10B981", glow: "rgba(16, 185, 129, 0.28)", face: "#064E3B", label: "Charged" }
      : persona === "Moderate Risk"
      ? { fill: "#F59E0B", glow: "rgba(245, 158, 11, 0.25)", face: "#451A03", label: "Draining" }
      : { fill: "#FF5C7A", glow: "rgba(255, 92, 122, 0.35)", face: "#2A0814", label: "Low battery" };

  const fillHeight = Math.max(14, (pct / 100) * 84);
  const fillY = 108 - fillHeight;

  return (
    <div className="battery-widget" aria-label={`Mental energy battery at ${pct}%`}>
      <svg viewBox="0 0 110 128" className="battery-svg">
        <defs>
          <clipPath id="battery-inner-clip">
            <rect x="19" y="22" width="72" height="88" rx="14" />
          </clipPath>
        </defs>

        {/* Battery terminal cap */}
        <rect x="41" y="6" width="28" height="10" rx="4" fill="currentColor" fillOpacity="0.35" />

        {/* Outer shell */}
        <rect
          x="15"
          y="18"
          width="80"
          height="96"
          rx="18"
          fill="var(--surface-elevated)"
          stroke="var(--border-strong)"
          strokeWidth="3.5"
        />

        {/* Animated liquid charge level */}
        <g clipPath="url(#battery-inner-clip)">
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
            height="5"
            fill="#FFFFFF"
            fillOpacity="0.32"
            className="battery-liquid"
          />
        </g>

        {/* Expressive mascot face */}
        {persona === "Balanced" && (
          <g stroke={tone.face} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M 37 58 Q 41 52 45 58" />
            <path d="M 65 58 Q 69 52 73 58" />
            <path d="M 44 71 Q 55 81 66 71" />
            <circle cx="82" cy="34" r="2.6" fill="#FFFFFF" stroke="none" />
            <circle cx="29" cy="39" r="1.8" fill="#FFFFFF" stroke="none" />
          </g>
        )}

        {persona === "Moderate Risk" && (
          <g stroke={tone.face} strokeWidth="3" strokeLinecap="round" fill="none">
            <line x1="36" y1="57" x2="46" y2="57" />
            <line x1="64" y1="57" x2="74" y2="57" />
            <line x1="45" y1="73" x2="65" y2="71" />
          </g>
        )}

        {persona === "High Burnout Risk" && (
          <g stroke="#FFF5F7" strokeWidth="2.8" strokeLinecap="round" fill="none">
            <path d="M 36 53 L 44 59 M 44 53 L 36 59" />
            <path d="M 66 53 L 74 59 M 74 53 L 66 59" />
            <path d="M 44 75 Q 55 67 66 75" />
            {/* Sweat drop */}
            <path
              d="M 81 37 C 81 37 85 43 85 46 A 4 4 0 1 1 77 46 C 77 43 81 37 81 37 Z"
              fill="#93C5FD"
              stroke="none"
            />
          </g>
        )}
      </svg>
      <div className="battery-caption">
        <span className="tabular-readout battery-pct" style={{ color: tone.fill }}>
          {pct}%
        </span>
        <span className="battery-status">{tone.label}</span>
      </div>
    </div>
  );
}
