import { useMemo, useState } from "react";

const PERSONA_COLORS = {
  Balanced: "#1B7F5C",
  "Moderate Risk": "#C87A19",
  "High Burnout Risk": "#C93B4B",
};

const WIDTH = 760;
const HEIGHT = 360;
const PAD = { top: 28, right: 28, bottom: 38, left: 28 };

export default function CohortMap({
  students,
  centroids,
  userPoint,
  userPersona,
  baselinePoint,
}) {
  const [hovered, setHovered] = useState(null);

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
    if (userPoint) {
      minX = Math.min(minX, userPoint.x);
      maxX = Math.max(maxX, userPoint.x);
      minY = Math.min(minY, userPoint.y);
      maxY = Math.max(maxY, userPoint.y);
    }
    if (baselinePoint) {
      minX = Math.min(minX, baselinePoint.x);
      maxX = Math.max(maxX, baselinePoint.x);
      minY = Math.min(minY, baselinePoint.y);
      maxY = Math.max(maxY, baselinePoint.y);
    }
    const padX = (maxX - minX) * 0.09 || 1;
    const padY = (maxY - minY) * 0.12 || 1;
    return {
      minX: minX - padX,
      maxX: maxX + padX,
      minY: minY - padY,
      maxY: maxY + padY,
    };
  }, [students, userPoint, baselinePoint]);

  const toPx = (x, y) => {
    const plotW = WIDTH - PAD.left - PAD.right;
    const plotH = HEIGHT - PAD.top - PAD.bottom;
    const px = PAD.left + ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * plotW;
    const py = PAD.top + (1 - (y - bounds.minY) / (bounds.maxY - bounds.minY)) * plotH;
    return { px, py };
  };

  const userPx = userPoint ? toPx(userPoint.x, userPoint.y) : null;
  const basePx = baselinePoint ? toPx(baselinePoint.x, baselinePoint.y) : null;
  const originPx = toPx(0, 0);

  return (
    <div className="cohort-map-wrap">
      <div className="cohort-map-header">
        <div>
          <h2 className="section-title">Where your routine sits among 705 students</h2>
          <p className="section-caption">
            Hover any dot to inspect a real student profile. Drag the sliders to watch your marker move.
          </p>
        </div>
        <div className="map-legend" aria-label="Student groups">
          <span className="legend-item">
            <span className="legend-dot" style={{ background: PERSONA_COLORS.Balanced }} />
            Balanced
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: PERSONA_COLORS["Moderate Risk"] }} />
            Moderate risk
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: PERSONA_COLORS["High Burnout Risk"] }} />
            High burnout risk
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot-you" />
            You
          </span>
        </div>
      </div>

      <div className="svg-frame">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="cohort-svg"
          role="img"
          aria-label="Scatter map of 705 students grouped by screen time, sleep, conflicts, and mental well-being"
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
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2557D6" />
            </marker>
          </defs>

          {/* Subtle structural crosshairs */}
          <line
            x1={PAD.left}
            y1={originPx.py}
            x2={WIDTH - PAD.right}
            y2={originPx.py}
            stroke="#DCE4EE"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <line
            x1={originPx.px}
            y1={PAD.top}
            x2={originPx.px}
            y2={HEIGHT - PAD.bottom}
            stroke="#DCE4EE"
            strokeWidth="1"
            strokeDasharray="3 4"
          />

          {/* 705 Real Students */}
          {students.map((s) => {
            const { px, py } = toPx(s.x, s.y);
            const isHovered = hovered && hovered.id === s.id;
            return (
              <circle
                key={s.id}
                cx={px}
                cy={py}
                r={isHovered ? 6 : 3.2}
                fill={PERSONA_COLORS[s.persona] || "#52627A"}
                fillOpacity={isHovered ? 0.95 : 0.42}
                stroke={isHovered ? "#142033" : "none"}
                strokeWidth={isHovered ? 1.8 : 0}
                className="student-dot"
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}

          {/* Soft cluster centroid labels */}
          {centroids.map((c) => {
            const { px, py } = toPx(c.x, c.y);
            const color = PERSONA_COLORS[c.persona] || "#142033";
            const labelText =
              c.persona === "High Burnout Risk"
                ? `High burnout (${c.count})`
                : c.persona === "Moderate Risk"
                ? `Moderate (${c.count})`
                : `Balanced (${c.count})`;
            return (
              <g key={c.persona} transform={`translate(${px}, ${py - 18})`} pointerEvents="none">
                <rect
                  x="-54"
                  y="-12"
                  width="108"
                  height="20"
                  rx="10"
                  fill="#FAFBFD"
                  fillOpacity="0.9"
                  stroke={color}
                  strokeOpacity="0.4"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="1.5"
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="600"
                  fill={color}
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {labelText}
                </text>
              </g>
            );
          })}

          {/* Baseline Pin + Trajectory Line */}
          {basePx && userPx && (Math.hypot(userPx.px - basePx.px, userPx.py - basePx.py) > 6) && (
            <g pointerEvents="none">
              <line
                x1={basePx.px}
                y1={basePx.py}
                x2={userPx.px}
                y2={userPx.py}
                stroke="#2557D6"
                strokeWidth="2"
                strokeDasharray="5 4"
                markerEnd="url(#trajectory-arrow)"
              />
              <circle
                cx={basePx.px}
                cy={basePx.py}
                r="7"
                fill="#FAFBFD"
                stroke="#52627A"
                strokeWidth="2"
                strokeDasharray="2 2"
              />
              <text
                x={basePx.px}
                y={basePx.py + 19}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="600"
                fill="#52627A"
                fontFamily="Plus Jakarta Sans, sans-serif"
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
              <circle r="15" fill="#2557D6" fillOpacity="0.16" className="beacon-halo" />
              <circle
                r="7.5"
                fill="#2557D6"
                stroke="#FAFBFD"
                strokeWidth="2.5"
              />
              <rect
                x="-19"
                y="-28"
                width="38"
                height="18"
                rx="9"
                fill="#142033"
              />
              <text
                x="0"
                y="-15.5"
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="700"
                fill="#FAFBFD"
                fontFamily="Instrument Sans, sans-serif"
              >
                You
              </text>
            </g>
          )}

          {/* Axis direction hints */}
          <text
            x={PAD.left}
            y={HEIGHT - 10}
            textAnchor="start"
            fontSize="11"
            fill="#52627A"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            More rested and balanced
          </text>
          <text
            x={WIDTH - PAD.right}
            y={HEIGHT - 10}
            textAnchor="end"
            fontSize="11"
            fill="#52627A"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            Higher screen and conflict strain
          </text>
        </svg>

        {hovered && (
          <div className="student-tooltip" role="status">
            <div className="tooltip-top">
              <strong>Student #{hovered.id}</strong>
              <span
                className="tooltip-tag"
                style={{ color: PERSONA_COLORS[hovered.persona] }}
              >
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
    </div>
  );
}
