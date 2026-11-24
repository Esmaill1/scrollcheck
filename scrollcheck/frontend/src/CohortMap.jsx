import { useMemo, useState } from "react";
import AppIcon from "./AppIcon.jsx";

const PERSONA_COLORS = {
  Balanced: "#10B981",
  "Moderate Risk": "#F59E0B",
  "High Burnout Risk": "#F43F5E",
};

const PERSONA_AR = {
  Balanced: "متوازن",
  "Moderate Risk": "ضغط متوسط",
  "High Burnout Risk": "إرهاق عالي",
};

const LEVEL_AR = {
  "High School": "ثانوي",
  Undergraduate: "جامعة",
  Graduate: "دراسات عليا",
};

const FILTER_OPTIONS = [
  { id: "all", label: "الكل" },
  { id: "TikTok", label: "TikTok" },
  { id: "Instagram", label: "Instagram" },
  { id: "Undergrad", label: "جامعة" },
];

const WIDTH = 760;
const HEIGHT = 320;
const PAD = { top: 28, right: 26, bottom: 34, left: 26 };

export default function CohortMap({
  students,
  centroids,
  userPoint,
  baselinePoint,
  nearestTwin,
  onTwinClick,
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
    <div className="surface-card cohort-map-panel">
      <div className="cohort-map-header">
        <div>
          <h2 className="section-title">مكانك وسط 705 طالب حقيقي</h2>
          <p className="section-caption">
            الشمال نوم وتوازن، واليمين سكرول وضغط عالي. شاور على أي نقطة لتفاصيلها.
          </p>
        </div>

        <div className="map-filter-strip" role="group" aria-label="فلتر الطلبة">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`map-filter-btn ${filter === opt.id ? "is-active" : ""}`}
              onClick={() => setFilter(opt.id)}
            >
              {(opt.id === "TikTok" || opt.id === "Instagram") && <AppIcon name={opt.id} size={14} />}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="map-legend-inline" aria-label="دليل الخريطة">
        <span><i style={{ background: PERSONA_COLORS.Balanced }} />متوازن</span>
        <span><i style={{ background: PERSONA_COLORS["Moderate Risk"] }} />متوسط</span>
        <span><i style={{ background: PERSONA_COLORS["High Burnout Risk"] }} />إرهاق عالي</span>
        <span><i className="legend-dot-you" />أنت</span>
        <span><i className="legend-dot-twin" />توأمك</span>
      </div>

      <div className="svg-frame" dir="ltr">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="cohort-svg"
          role="img"
          aria-label="خريطة تفاعلية لـ 705 طالب حسب وقت الموبايل والنوم"
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
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--accent)" />
            </marker>
          </defs>

          <line
            x1={PAD.left}
            y1={originPx.py}
            x2={WIDTH - PAD.right}
            y2={originPx.py}
            stroke="var(--map-grid)"
            strokeWidth="1"
          />
          <line
            x1={originPx.px}
            y1={PAD.top}
            x2={originPx.px}
            y2={HEIGHT - PAD.bottom}
            stroke="var(--map-grid)"
            strokeWidth="1"
          />

          {visibleStudents.map((s) => {
            const { px, py } = toPx(s.x, s.y);
            const isHovered = hovered && hovered.id === s.id;
            const isTwin = nearestTwin && nearestTwin.id === s.id;
            return (
              <circle
                key={s.id}
                cx={px}
                cy={py}
                r={isHovered ? 6 : isTwin ? 5 : 2.9}
                fill={PERSONA_COLORS[s.persona] || "#94A3B8"}
                fillOpacity={isHovered || isTwin ? 0.96 : 0.45}
                stroke={isHovered ? "var(--ink-primary)" : isTwin ? "var(--twin-accent)" : "none"}
                strokeWidth={isHovered ? 1.8 : isTwin ? 2 : 0}
                className="student-dot"
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}

          {centroids.map((c) => {
            const { px, py } = toPx(c.x, c.y);
            const color = PERSONA_COLORS[c.persona] || "var(--ink-primary)";
            const labelText =
              c.persona === "High Burnout Risk"
                ? `إرهاق (${c.count})`
                : c.persona === "Moderate Risk"
                ? `متوسط (${c.count})`
                : `متوازن (${c.count})`;
            return (
              <text
                key={c.persona}
                x={px}
                y={py - 14}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill={color}
                fontFamily="Cairo, sans-serif"
                pointerEvents="none"
              >
                {labelText}
              </text>
            );
          })}

          {twinPx && userPx && (
            <g pointerEvents="none">
              <line
                x1={userPx.px}
                y1={userPx.py}
                x2={twinPx.px}
                y2={twinPx.py}
                stroke="var(--twin-accent)"
                strokeWidth="1.3"
                strokeDasharray="3 3"
                strokeOpacity="0.8"
                className="twin-tether-line"
              />
              <circle
                cx={twinPx.px}
                cy={twinPx.py}
                r="7.5"
                fill="none"
                stroke="var(--twin-accent)"
                strokeWidth="1.8"
              />
            </g>
          )}

          {basePx && userPx && Math.hypot(userPx.px - basePx.px, userPx.py - basePx.py) > 6 && (
            <g pointerEvents="none">
              <line
                x1={basePx.px}
                y1={basePx.py}
                x2={userPx.px}
                y2={userPx.py}
                stroke="var(--accent)"
                strokeWidth="2"
                strokeDasharray="4 4"
                markerEnd="url(#trajectory-arrow)"
                className="trajectory-line"
              />
              <circle
                cx={basePx.px}
                cy={basePx.py}
                r="6"
                fill="var(--surface)"
                stroke="var(--ink-secondary)"
                strokeWidth="1.8"
              />
              <text
                x={basePx.px}
                y={basePx.py + 18}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="var(--ink-secondary)"
                fontFamily="Cairo, sans-serif"
              >
                البداية
              </text>
            </g>
          )}

          {userPx && (
            <g
              className="user-beacon"
              style={{ transform: `translate(${userPx.px}px, ${userPx.py}px)` }}
              pointerEvents="none"
            >
              <circle r="15" fill="var(--accent)" fillOpacity="0.2" className="beacon-halo" />
              <circle r="7" fill="var(--accent)" stroke="#FFFFFF" strokeWidth="2.2" />
              <rect x="-18" y="-28" width="36" height="17" rx="8.5" fill="var(--ink-primary)" />
              <text
                x="0"
                y="-16.5"
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="var(--bg-canvas)"
                fontFamily="Cairo, sans-serif"
              >
                أنت
              </text>
            </g>
          )}

          <text
            x={PAD.left}
            y={HEIGHT - 9}
            textAnchor="start"
            fontSize="10.5"
            fill="var(--ink-secondary)"
            fontFamily="IBM Plex Sans Arabic, sans-serif"
          >
            نوم وتوازن
          </text>
          <text
            x={WIDTH - PAD.right}
            y={HEIGHT - 9}
            textAnchor="end"
            fontSize="10.5"
            fill="var(--ink-secondary)"
            fontFamily="IBM Plex Sans Arabic, sans-serif"
          >
            سكرول وضغط عالي
          </text>
        </svg>

        {hovered && (
          <div className="student-tooltip" dir="rtl" role="status">
            <div className="tooltip-top">
              <strong>
                طالب #{hovered.id} ({hovered.age} سنة، {hovered.country})
              </strong>
              <span style={{ color: PERSONA_COLORS[hovered.persona] }}>
                {PERSONA_AR[hovered.persona] || hovered.persona}
              </span>
            </div>
            <div className="tooltip-grid">
              <span>موبايل {hovered.usage_hours} س</span>
              <span>نوم {hovered.sleep_hours} س</span>
              <span>توتر {hovered.conflicts}/5</span>
              <span>نفسية {hovered.mental_health}/10</span>
              <span>{hovered.platform}</span>
              <span>تأثير دراسي: {hovered.academics_affected === "Yes" ? "آه" : "لأ"}</span>
            </div>
          </div>
        )}
      </div>

      {nearestTwin && (
        <div className="twin-line">
          <button
            type="button"
            key={nearestTwin.id}
            className="twin-pill twin-pill-btn"
            onClick={(e) => onTwinClick?.(nearestTwin, e)}
            title="اضغط لتبعت سلام لتوأمك"
          >
            تشابه <span className="tabular-readout">{nearestTwin.similarity_pct}%</span>
          </button>
          <p>
            <strong>أقرب طالب شبهك:</strong> طالب #{nearestTwin.id} ({nearestTwin.age} سنة،{" "}
            {LEVEL_AR[nearestTwin.academic_level] || nearestTwin.academic_level} من{" "}
            {nearestTwin.country}) — {nearestTwin.platform} {nearestTwin.usage_hours} س، نوم{" "}
            {nearestTwin.sleep_hours} س، درجاته اتأثرت:{" "}
            <strong>{nearestTwin.academics_affected === "Yes" ? "آه" : "لأ"}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
