export default function DayRing({ usageHours, sleepHours, semesterImpact }) {
  const total = 24;
  const scrollFrac = Math.min(0.65, Math.max(0.02, usageHours / total));
  const sleepFrac = Math.min(0.65, Math.max(0.1, sleepHours / total));
  const lifeFrac = Math.max(0.04, 1 - scrollFrac - sleepFrac);

  const radius = 44;
  const circ = 2 * Math.PI * radius;

  const scrollLen = scrollFrac * circ;
  const sleepLen = sleepFrac * circ;
  const lifeLen = lifeFrac * circ;

  const daysYear = semesterImpact
    ? semesterImpact.days_per_year_scrolling
    : Number(((usageHours * 365) / 24).toFixed(1));
  const semScroll = semesterImpact
    ? semesterImpact.semester_scroll_hours
    : Math.round(usageHours * 112);
  const semDebt = semesterImpact
    ? semesterImpact.semester_sleep_debt_hours
    : Math.round(Math.max(0, 8 - sleepHours) * 112);

  return (
    <div className="day-ring-widget">
      <div className="day-ring-title">Where your 24 hours go</div>
      <div className="day-ring-visual">
        <svg viewBox="0 0 120 120" className="day-ring-svg" role="img" aria-label="24-hour daily time split">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--ring-track)"
            strokeWidth="13"
          />
          {/* Life & Study */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--ring-life)"
            strokeWidth="13"
            strokeDasharray={`${lifeLen} ${circ}`}
            strokeDashoffset={-(scrollLen + sleepLen)}
            transform="rotate(-90 60 60)"
            className="ring-arc"
          />
          {/* Sleep */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--ring-sleep)"
            strokeWidth="13"
            strokeDasharray={`${sleepLen} ${circ}`}
            strokeDashoffset={-scrollLen}
            transform="rotate(-90 60 60)"
            className="ring-arc"
          />
          {/* Scrolling */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--ring-scroll)"
            strokeWidth="13"
            strokeDasharray={`${scrollLen} ${circ}`}
            strokeDashoffset="0"
            transform="rotate(-90 60 60)"
            className="ring-arc"
          />
          <text
            x="60"
            y="56"
            textAnchor="middle"
            fontSize="16"
            fontWeight="800"
            fill="var(--ink-primary)"
            fontFamily="Bricolage Grotesque, sans-serif"
          >
            {daysYear}d
          </text>
          <text
            x="60"
            y="71"
            textAnchor="middle"
            fontSize="8.8"
            fontWeight="600"
            fill="var(--ink-secondary)"
            fontFamily="Space Grotesk, sans-serif"
          >
            scrolling/yr
          </text>
        </svg>
      </div>

      <div className="day-ring-facts">
        <div className="ring-legend-row">
          <span><i style={{ background: "var(--ring-scroll)" }} />Scroll {usageHours.toFixed(1)}h</span>
          <span><i style={{ background: "var(--ring-sleep)" }} />Sleep {sleepHours.toFixed(1)}h</span>
          <span><i style={{ background: "var(--ring-life)" }} />Free {Math.max(0, 24 - usageHours - sleepHours).toFixed(1)}h</span>
        </div>
        <div className="semester-pills">
          <div className="sem-stat">
            <strong className="tabular-readout">{semScroll} hrs</strong>
            <span>scrolling per semester</span>
          </div>
          <div className="sem-stat">
            <strong className="tabular-readout">{semDebt} hrs</strong>
            <span>semester sleep debt</span>
          </div>
        </div>
      </div>
    </div>
  );
}
