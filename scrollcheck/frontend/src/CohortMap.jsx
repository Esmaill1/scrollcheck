import { useMemo, useState } from "react";

const PERSONA_COLORS = {
  Balanced: "#10B981",
  "Moderate Risk": "#F59E0B",
  "High Burnout Risk": "#FF5C7A",
};

const PERSONA_AR = {
  Balanced: "متوازن ورايق",
  "Moderate Risk": "ضغط متوسط",
  "High Burnout Risk": "إرهاق عالي",
};

const LEVEL_AR = {
  "High School": "ثانوي",
  Undergraduate: "جامعة",
  Graduate: "دراسات عليا",
};

const FILTER_OPTIONS = [
  { id: "all", label: "كل الـ 705" },
  { id: "TikTok", label: "TikTok" },
  { id: "Instagram", label: "Instagram" },
  { id: "Undergrad", label: "طلبة جامعة" },
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
          <h2 className="section-title">مكانك وسط 705 طالب حقيقي</h2>
          <p className="section-caption">
            كل نقطة هنا طالب حقيقي من الاستبيان. الشمال يعني نوم مظبوط وتوازن، واليمين يعني سكرول كتير وإرهاق. شاور على أي نقطة تشوف تفاصيلها.
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
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="map-legend-inline" aria-label="دليل ألوان الخريطة">
        <span><i style={{ background: PERSONA_COLORS.Balanced }} />متوازن</span>
        <span><i style={{ background: PERSONA_COLORS["Moderate Risk"] }} />ضغط متوسط</span>
        <span><i style={{ background: PERSONA_COLORS["High Burnout Risk"] }} />إرهاق عالي</span>
        <span><i className="legend-dot-you" />أنت دلوقتي</span>
        <span><i className="legend-dot-twin" />توأمك في البيانات</span>
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
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--accent-primary)" />
            </marker>
          </defs>

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
              <g key={c.persona} transform={`translate(${px}, ${py - 18})`} pointerEvents="none">
                <rect
                  x="-48"
                  y="-11"
                  width="96"
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
                  y="3"
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="700"
                  fill={color}
                  fontFamily="Cairo, sans-serif"
                >
                  {labelText}
                </text>
              </g>
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
                y={basePx.py + 20}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="700"
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
              <circle r="17" fill="var(--accent-primary)" fillOpacity="0.22" className="beacon-halo" />
              <circle
                r="8"
                fill="var(--accent-primary)"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
              <rect
                x="-21"
                y="-31"
                width="42"
                height="19"
                rx="9.5"
                fill="var(--ink-primary)"
              />
              <text
                x="0"
                y="-18"
                textAnchor="middle"
                fontSize="10.5"
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
            y={HEIGHT - 10}
            textAnchor="start"
            fontSize="11"
            fill="var(--ink-secondary)"
            fontFamily="IBM Plex Sans Arabic, sans-serif"
          >
            نوم مظبوط وتوازن
          </text>
          <text
            x={WIDTH - PAD.right}
            y={HEIGHT - 10}
            textAnchor="end"
            fontSize="11"
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
              <span className="tooltip-tag" style={{ color: PERSONA_COLORS[hovered.persona] }}>
                {PERSONA_AR[hovered.persona] || hovered.persona}
              </span>
            </div>
            <div className="tooltip-grid">
              <span>موبايل {hovered.usage_hours} س/يوم</span>
              <span>نوم {hovered.sleep_hours} س/ليل</span>
              <span>توتر {hovered.conflicts}/5</span>
              <span>نفسية {hovered.mental_health}/10</span>
              <span>{hovered.platform}</span>
              <span>أثّر على درجاته: {hovered.academics_affected === "Yes" ? "آه" : "لأ"}</span>
            </div>
          </div>
        )}
      </div>

      {nearestTwin && (
        <div className="twin-strip">
          <div className="twin-badge">
            تشابه <span className="tabular-readout">{nearestTwin.similarity_pct}%</span>
          </div>
          <p className="twin-copy">
            <strong>أقرب طالب شبهك في البيانات:</strong> طالب #{nearestTwin.id} ({nearestTwin.age} سنة،{" "}
            {LEVEL_AR[nearestTwin.academic_level] || nearestTwin.academic_level} من {nearestTwin.country}) —
            بيستخدم <strong>{nearestTwin.platform}</strong> {nearestTwin.usage_hours} س/يوم، بينام{" "}
            {nearestTwin.sleep_hours} س، نفسيته {nearestTwin.mental_health}/10، ومستواه الدراسي اتأثر:{" "}
            <strong>{nearestTwin.academics_affected === "Yes" ? "آه" : "لأ"}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
