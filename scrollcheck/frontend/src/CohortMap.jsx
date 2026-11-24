import { useMemo, useState } from "react";

const PERSONA_COLORS = {
  Balanced: "#10B981",
  "Moderate Risk": "#F59E0B",
  "High Burnout Risk": "#FF5C7A",
};

const FILTER_OPTIONS = [
  { id: "all", label: "All 705" },
  { id: "TikTok", label: "TikTok" },
  { id: "Instagram", label: "Instagram" },
  { id: "Undergrad", label: "Undergrads" },
];

const WIDTH = 760;
const HEIGHT = 340;
const PAD = { top: 30, right: 28, bottom: 38, left: 28 };

export default function CohortMap({
  students,
  centroids,
  userPoint,
  baselinePoint,
  nearestTwin,
}) {
  const [hovered, setHovered] = useState(null);
  const [filter, setFilter] = useState("all");

  const visibleStudents = useMemo(() => {
    if (filter === "TikTok") return students.filter((s) => s.platform === "TikTok");
    if (filter === "Instagram") return students.filter((s) => s.platform === "Instagram");
    if (filter === "Undergrad") return students.filter((s) => s.academic_level === "Undergraduate");
    return students;
  }, [students, filter]);

  const bounds = useMemo(() => {
    if (!students.length) {
      return { minX: -4, maxX: 4, minY: -3, maxY: 3 };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const s of students) {
      if (s.x < minX) minX = s.x;
      if (s.x > maxX) maxX = s.x;
      if (s.y < minY) minY = s.y;
      if (s.y > maxY) maxY = s.y;
    }
    for (const pt of [userPoint, baselinePoint, nearestTwin]) {
      if (pt) {
        minX = Math.min(minX, pt.x);
        maxX = Math.max(maxX, pt.x);
        minY = Math.min(minY, pt.y);
        maxY = Math.max(maxY, pt.y);
      }
    }
    const padX = (maxX - minX) * 0.09 || 1;
    const padY = (maxY - minY) * 0.13 || 1;
    return {
      minX: minX - padX,
      maxX: maxX + padX,
      minY: minY - padY,
      maxY: maxY + padY,
    };
  }, [students, userPoint, baselinePoint, nearestTwin]);

  const toPx = (x, y) => {
    const plotW = WIDTH - PAD.left - PAD.right;
    const plotH = HEIGHT - PAD.top - PAD.bottom;
    const px = PAD.left + ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * plotW;
    const py = PAD.top + (1 - (y - bounds.minY) / (bounds.maxY - bounds.minY)) * plotH;
    return { px, py };
  };

  const userPx = userPoint ? toPx(userPoint.x, userPoint.y) : null;
  const basePx = baselinePoint ? toPx(baselinePoint.x, baselinePoint.y) : null;
  const twinPx = nearestTwin ? toPx(nearestTwin.x, nearestTwin.y) : null;
  const originPx = toPx(0, 0);

  return (
    <div className="panel cohort-map-panel">
      <div className="cohort-map-header">
        <div>
          <h2 className="section-title">Live 705-student galaxy</h2>
          <p className="section-caption">
            Slice the crowd, hover any student dot, or follow your glowing beacon and data twin.
          </p>
        </div>

        <div className="map-filter-strip" role="group" aria-label="Filter cohort">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`map-filter-btn ${filter === opt.id ? "is-active" : ""}`}
              onClick={() => setFilter(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="svg-frame">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="cohort-svg"
          role="img"
          aria-label="Interactive scatter map of 705 students grouped by screen time, sleep, and mental well-being"
        >
          <defs>
            <marker
              id="trajectory-arrow"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--accent-primary)" />
            </marker>
          </defs>

          {/* Hairline crosshairs */}
          <line
            x1={PAD.left}
            y1={originPx.py}
            x2={WIDTH - PAD.right}
            y2={originPx.py}
            stroke="var(--map-grid)"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          <line
            x1={originPx.px}
            y1={PAD.top}
            x2={originPx.px}
            y2={HEIGHT - PAD.bottom}
            stroke="var(--map-grid)"
            strokeWidth="1"
            strokeDasharray="3 5"
          />

          {/* Real student dots */}
          {visibleStudents.map((s) => {
            const { px, py } = toPx(s.x, s.y);
            const isHovered = hovered && hovered.id === s.id;
            const isTwin = nearestTwin && nearestTwin.id === s.id;
            return (
              <circle
                key={s.id}
                cx={px}
                cy={py}
                r={isHovered ? 6.5 : isTwin ? 5.5 : 3.3}
                fill={PERSONA_COLORS[s.persona] || "#94A3B8"}
                fillOpacity={isHovered || isTwin ? 0.96 : 0.48}
                stroke={isHovered ? "var(--ink-primary)" : isTwin ? "var(--twin-accent)" : "none"}
                strokeWidth={isHovered ? 2 : isTwin ? 2.2 : 0}
                className="student-dot"
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}

          {/* Cluster labels */}
          {centroids.map((c) => {
            const { px, py } = toPx(c.x, c.y);
            const color = PERSONA_COLORS[c.persona] || "var(--ink-primary)";
            const labelText =
              c.persona === "High Burnout Risk"
                ? `Burnout (${c.count})`
                : c.persona === "Moderate Risk"
                ? `Moderate (${c.count})`
                : `Balanced (${c.count})`;
            return (
              <g key={c.persona} transform={`translate(${px}, ${py - 18})`} pointerEvents="none">
                <rect
                  x="-50"
                  y="-11"
                  width="100"
                  height="20"
                  rx="10"
                  fill="var(--surface-elevated)"
                  fillOpacity="0.92"
                  stroke={color}
                  strokeOpacity="0.55"
                  strokeWidth="1.2"
                />
                <text
                  x="0"
                  y="2.5"
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="700"
                  fill={color}
                  fontFamily="Space Grotesk, sans-serif"
                >
                  {labelText}
                </text>
              </g>
            );
          })}

          {/* Link from You -> Nearest Twin */}
          {twinPx && userPx && (
            <g pointerEvents="none">
              <line
                x1={userPx.px}
                y1={userPx.py}
                x2={twinPx.px}
                y2={twinPx.py}
                stroke="var(--twin-accent)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                strokeOpacity="0.8"
              />
              <circle
                cx={twinPx.px}
                cy={twinPx.py}
                r="8.5"
                fill="none"
                stroke="var(--twin-accent)"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Start -> You trajectory */}
          {basePx && userPx && Math.hypot(userPx.px - basePx.px, userPx.py - basePx.py) > 6 && (
            <g pointerEvents="none">
              <line
                x1={basePx.px}
                y1={basePx.py}
                x2={userPx.px}
                y2={userPx.py}
                stroke="var(--accent-primary)"
                strokeWidth="2.4"
                strokeDasharray="5 4"
                markerEnd="url(#trajectory-arrow)"
              />
              <circle
                cx={basePx.px}
                cy={basePx.py}
                r="7"
                fill="var(--surface-elevated)"
                stroke="var(--ink-secondary)"
                strokeWidth="2"
                strokeDasharray="2 2"
              />
              <text
                x={basePx.px}
                y={basePx.py + 19}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="700"
                fill="var(--ink-secondary)"
                fontFamily="Space Grotesk, sans-serif"
              >
                Start
              </text>
            </g>
          )}

          {/* Live User Beacon */}
          {userPx && (
            <g
              className="user-beacon"
              style={{ transform: `translate(${userPx.px}px, ${userPx.py}px)` }}
              pointerEvents="none"
            >
              <circle r="17" fill="var(--accent-primary)" fillOpacity="0.22" className="beacon-halo" />
              <circle
                r="8"
                fill="var(--accent-primary)"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
              <rect
                x="-20"
                y="-30"
                width="40"
                height="18"
                rx="9"
                fill="var(--ink-primary)"
              />
              <text
                x="0"
                y="-17.5"
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="700"
                fill="var(--bg-canvas)"
                fontFamily="Bricolage Grotesque, sans-serif"
              >
                You
              </text>
            </g>
          )}

          <text
            x={PAD.left}
            y={HEIGHT - 10}
            textAnchor="start"
            fontSize="11"
            fill="var(--ink-secondary)"
            fontFamily="Space Grotesk, sans-serif"
          >
            Rested &amp; balanced
          </text>
          <text
            x={WIDTH - PAD.right}
            y={HEIGHT - 10}
            textAnchor="end"
            fontSize="11"
            fill="var(--ink-secondary)"
            fontFamily="Space Grotesk, sans-serif"
          >
            Heavy scrolling &amp; tension
          </text>
        </svg>

        {hovered && (
          <div className="student-tooltip" role="status">
            <div className="tooltip-top">
              <strong>
                Student #{hovered.id} ({hovered.age}y, {hovered.country})
              </strong>
              <span className="tooltip-tag" style={{ color: PERSONA_COLORS[hovered.persona] }}>
                {hovered.persona}
              </span>
            </div>
            <div className="tooltip-grid">
              <span>{hovered.usage_hours}h screen / day</span>
              <span>{hovered.sleep_hours}h sleep / night</span>
              <span>{hovered.conflicts} tension score</span>
              <span>Well-being {hovered.mental_health}/10</span>
              <span>{hovered.platform}</span>
              <span>Grades hurt: {hovered.academics_affected}</span>
            </div>
          </div>
        )}
      </div>

      {/* Real-world Data Twin strip */}
      {nearestTwin && (
        <div className="twin-strip">
          <div className="twin-badge">
            <span className="tabular-readout">{nearestTwin.similarity_pct}%</span> match
          </div>
          <p className="twin-copy">
            <strong>Your real-world data twin:</strong> Student #{nearestTwin.id} ({nearestTwin.age}y{" "}
            {nearestTwin.academic_level} in {nearestTwin.country}) — uses{" "}
            <strong>{nearestTwin.platform}</strong> for {nearestTwin.usage_hours}h/day, sleeps{" "}
            {nearestTwin.sleep_hours}h, well-being {nearestTwin.mental_health}/10, grades hurt:{" "}
            <strong>{nearestTwin.academics_affected}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
