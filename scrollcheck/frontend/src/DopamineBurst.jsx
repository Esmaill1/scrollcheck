const PALETTE = ["#F96B1C", "#10B981", "#F59E0B", "#6366F1", "#FB7185"];

const SPARK_COUNT = 10;
const CONFETTI_COUNT = 26;

function buildSparkParticles(seed) {
  return Array.from({ length: SPARK_COUNT }, (_, i) => {
    const angle = ((i / SPARK_COUNT) * Math.PI * 2) + ((seed % 7) * 0.14);
    const dist = 28 + ((i * 11 + seed) % 34);
    return {
      dx: `${(Math.cos(angle) * dist).toFixed(1)}px`,
      dy: `${(Math.sin(angle) * dist).toFixed(1)}px`,
      rot: `${((i * 47 + seed * 19) % 240) - 120}deg`,
      color: PALETTE[(i + seed) % PALETTE.length],
      delay: `${(i % 3) * 18}ms`,
      size: i % 2 === 0 ? "6px" : "4px",
    };
  });
}

function buildConfettiPieces(seed) {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => {
    const angle = (-Math.PI * 0.92) + (i / (CONFETTI_COUNT - 1)) * (Math.PI * 0.84);
    const spread = 80 + ((i * 23 + seed * 13) % 130);
    const dx = Math.cos(angle) * spread + (((i % 5) - 2) * 18);
    const dy = Math.sin(angle) * (75 + ((i * 17) % 85)) + 55;
    const shapes = ["pill", "dot", "diamond"];
    return {
      dx: `${dx.toFixed(1)}px`,
      dy: `${dy.toFixed(1)}px`,
      rot: `${((i * 73 + seed * 31) % 520) - 260}deg`,
      color: PALETTE[(i + seed) % PALETTE.length],
      delay: `${(i % 6) * 28}ms`,
      shape: shapes[i % shapes.length],
    };
  });
}

export default function DopamineBurst({ bursts = [] }) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !bursts.length) return null;

  return (
    <div className="dopamine-layer" aria-hidden="true">
      {bursts.map((b, idx) => {
        const seed = Number(b.id) || idx + 1;
        const x = Number.isFinite(b.x) ? b.x : typeof window !== "undefined" ? window.innerWidth / 2 : 400;
        const y = Number.isFinite(b.y) ? b.y : typeof window !== "undefined" ? Math.min(260, window.innerHeight * 0.28) : 220;

        if (b.kind === "float" && b.text) {
          return (
            <span
              key={b.id}
              className={`dopamine-float-chip ${b.tone ? `is-${b.tone}` : ""}`}
              style={{ left: `${x}px`, top: `${y}px` }}
            >
              {b.text}
            </span>
          );
        }

        if (b.kind === "confetti") {
          const pieces = buildConfettiPieces(seed);
          return (
            <div key={b.id} className="dopamine-origin" style={{ left: `${x}px`, top: `${y}px` }}>
              {pieces.map((p, pIdx) => (
                <span
                  key={pIdx}
                  className={`dopamine-confetti shape-${p.shape}`}
                  style={{
                    "--dx": p.dx,
                    "--dy": p.dy,
                    "--rot": p.rot,
                    "--color": p.color,
                    "--delay": p.delay,
                  }}
                />
              ))}
            </div>
          );
        }

        const sparks = buildSparkParticles(seed);
        return (
          <div key={b.id} className="dopamine-origin" style={{ left: `${x}px`, top: `${y}px` }}>
            {sparks.map((p, pIdx) => (
              <span
                key={pIdx}
                className="dopamine-spark"
                style={{
                  "--dx": p.dx,
                  "--dy": p.dy,
                  "--rot": p.rot,
                  "--color": p.color,
                  "--delay": p.delay,
                  width: p.size,
                  height: p.size,
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
