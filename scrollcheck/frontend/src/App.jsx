import { useEffect, useMemo, useState } from "react";
import BrainBattery from "./BrainBattery.jsx";
import CohortMap from "./CohortMap.jsx";
import DayRing from "./DayRing.jsx";
import QuickQuizModal from "./QuickQuizModal.jsx";

const PRESETS = [
  {
    id: "tiktok_spiral",
    label: "2 AM TikTok spiral",
    values: {
      age: 19,
      daily_usage_hours: 6.8,
      sleep_hours: 5.2,
      conflicts: 4,
      platform: "TikTok",
      academic_level: "Undergraduate",
      gender: "Female",
      relationship_status: "Complicated",
    },
  },
  {
    id: "exam_zombie",
    label: "Exam-week zombie",
    values: {
      age: 20,
      daily_usage_hours: 5.1,
      sleep_hours: 6.1,
      conflicts: 2,
      platform: "Instagram",
      academic_level: "Undergraduate",
      gender: "Male",
      relationship_status: "Single",
    },
  },
  {
    id: "morning_legend",
    label: "Morning person",
    values: {
      age: 22,
      daily_usage_hours: 2.8,
      sleep_hours: 8.0,
      conflicts: 0,
      platform: "YouTube",
      academic_level: "Graduate",
      gender: "Male",
      relationship_status: "Single",
    },
  },
];

const POWER_UPS = [
  {
    id: "no_phone_bed",
    label: "Phone outside bedroom",
    effect: "-1.2h screen, +0.9h sleep",
    usageDelta: -1.2,
    sleepDelta: 0.9,
    conflictsDelta: 0,
  },
  {
    id: "no_reels",
    label: "No Reels till Friday",
    effect: "-1.8h screen",
    usageDelta: -1.8,
    sleepDelta: 0,
    conflictsDelta: 0,
  },
  {
    id: "mute_study",
    label: "Mute chats while studying",
    effect: "-2 tension",
    usageDelta: 0,
    sleepDelta: 0,
    conflictsDelta: -2,
  },
  {
    id: "lights_out",
    label: "11 PM lights out",
    effect: "+1.5h sleep",
    usageDelta: 0,
    sleepDelta: 1.5,
    conflictsDelta: 0,
  },
];

const DEFAULT_PLATFORMS = [
  "Instagram",
  "TikTok",
  "Facebook",
  "YouTube",
  "WhatsApp",
  "Twitter",
  "LinkedIn",
  "Snapchat",
];

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

export default function App() {
  const [baseForm, setBaseForm] = useState(PRESETS[0].values);
  const [activePowerUps, setActivePowerUps] = useState([]);
  const [cohort, setCohort] = useState({
    students: [],
    centroids: [],
    model_stats: null,
    platforms: DEFAULT_PLATFORMS,
  });
  const [sim, setSim] = useState(null);
  const [baseline, setBaseline] = useState(null); // { baseForm, activePowerUps, result }
  const [showIntro, setShowIntro] = useState(true);
  const [profileSource, setProfileSource] = useState("Sample: 2 AM TikTok spiral");
  const [quizOpen, setQuizOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Derive effective routine = base sliders + active detox power-ups
  const effectiveForm = useMemo(() => {
    let usage = baseForm.daily_usage_hours;
    let sleep = baseForm.sleep_hours;
    let conflicts = baseForm.conflicts;

    for (const pid of activePowerUps) {
      const p = POWER_UPS.find((item) => item.id === pid);
      if (p) {
        usage += p.usageDelta;
        sleep += p.sleepDelta;
        conflicts += p.conflictsDelta;
      }
    }

    return {
      ...baseForm,
      daily_usage_hours: Number(clamp(usage, 1.5, 9.0).toFixed(1)),
      sleep_hours: Number(clamp(sleep, 4.0, 9.5).toFixed(1)),
      conflicts: clamp(conflicts, 0, 5),
    };
  }, [baseForm, activePowerUps]);

  // Load 705-student cohort once
  useEffect(() => {
    let active = true;
    fetch("/api/cohort")
      .then((res) => {
        if (!res.ok) throw new Error(`Backend responded with ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (active) setCohort(data);
      })
      .catch((err) => {
        if (active) setApiError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  // Re-simulate live on every routine change
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(effectiveForm),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Simulation failed (${res.status})`);
          return res.json();
        })
        .then((data) => {
          if (active) {
            setSim(data);
            setApiError(null);
          }
        })
        .catch((err) => {
          if (active) setApiError(err.message);
        });
    }, 60);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [effectiveForm]);

  const updateBaseField = (key, value) => {
    setProfileSource("Your custom routine");
    setBaseForm((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset) => {
    setBaseline(null);
    setActivePowerUps([]);
    setProfileSource(`Sample: ${preset.label}`);
    setBaseForm(preset.values);
  };

  const togglePowerUp = (id) => {
    if (!baseline && sim) {
      setBaseline({ baseForm: { ...baseForm }, activePowerUps: [...activePowerUps], result: sim });
    }
    setProfileSource("Your custom routine");
    setActivePowerUps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const pinStartingPoint = () => {
    if (!sim) return;
    setBaseline({ baseForm: { ...baseForm }, activePowerUps: [...activePowerUps], result: sim });
  };

  const resetToBaseline = () => {
    if (!baseline) return;
    setBaseForm(baseline.baseForm);
    setActivePowerUps(baseline.activePowerUps);
  };

  const tryMinimumFix = () => {
    if (!sim?.minimum_fix) return;
    if (!baseline) {
      setBaseline({ baseForm: { ...baseForm }, activePowerUps: [...activePowerUps], result: sim });
    }
    setProfileSource("Recommended detox plan");
    setActivePowerUps([]);
    setBaseForm((prev) => ({
      ...prev,
      daily_usage_hours: sim.minimum_fix.target_usage_hours,
      sleep_hours: sim.minimum_fix.target_sleep_hours,
      conflicts: sim.minimum_fix.target_conflicts,
    }));
  };

  const handleQuizComplete = (answers) => {
    setQuizOpen(false);
    setShowIntro(false);
    setBaseline(null);
    setActivePowerUps([]);
    setProfileSource("Your quiz routine");
    setBaseForm((prev) => ({ ...prev, ...answers }));
  };

  const copyWrappedSummary = () => {
    if (!sim) return;
    const summary = [
      `ScrollCheck Result: ${sim.archetype?.title || sim.persona}`,
      `Routine: ${effectiveForm.daily_usage_hours}h/day on ${effectiveForm.platform}, ${effectiveForm.sleep_hours}h sleep, ${effectiveForm.conflicts}/5 tension`,
      `Mental Battery: ${Math.round((sim.mental_health_score / 10) * 100)}% (${sim.mental_health_score}/10) | Grade Risk: ${Math.round(sim.academic_risk_prob * 100)}%`,
      `Scrolling footprint: ${sim.semester_impact?.days_per_year_scrolling} full days/year`,
    ].join("\n");
    navigator.clipboard?.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const persona = sim?.persona || "High Burnout Risk";
  const themeKey =
    sim?.archetype?.theme ||
    (persona === "Balanced" ? "balanced" : persona === "Moderate Risk" ? "moderate" : "burnout");

  const mhScore = sim ? sim.mental_health_score : 5.0;
  const riskPct = sim ? Math.round(sim.academic_risk_prob * 100) : 0;

  const mhDelta =
    baseline && sim
      ? Number((sim.mental_health_score - baseline.result.mental_health_score).toFixed(2))
      : null;
  const riskDelta =
    baseline && sim
      ? Math.round((sim.academic_risk_prob - baseline.result.academic_risk_prob) * 100)
      : null;

  return (
    <div className="app-shell" data-theme={themeKey}>
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-badge" aria-hidden="true">
            <span />
          </div>
          <div>
            <h1 className="brand-name">ScrollCheck</h1>
            <p className="brand-subtitle">
              What-if detox playground powered by 705 real students
            </p>
          </div>
        </div>

        <div className="topbar-actions">
          <button type="button" className="vibe-check-btn" onClick={() => setQuizOpen(true)}>
            15-sec vibe check
          </button>

          <div className="preset-strip" role="group" aria-label="Sample routines">
            {PRESETS.map((p) => {
              const isCurrent =
                activePowerUps.length === 0 &&
                baseForm.daily_usage_hours === p.values.daily_usage_hours &&
                baseForm.sleep_hours === p.values.sleep_hours &&
                baseForm.conflicts === p.values.conflicts &&
                baseForm.platform === p.values.platform;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`preset-btn ${isCurrent ? "is-active" : ""}`}
                  onClick={() => applyPreset(p)}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <button type="button" className="share-btn" onClick={copyWrappedSummary} disabled={!sim}>
            {copied ? "Copied!" : "Share result"}
          </button>
        </div>
      </header>

      {apiError && (
        <div className="error-banner" role="alert">
          Model service offline ({apiError}). Make sure FastAPI is running on port 8000.
        </div>
      )}

      {showIntro && (
        <section className="panel welcome-banner" aria-label="How ScrollCheck works">
          <div className="welcome-main">
            <div>
              <h2 className="welcome-title">
                Wondering if your scrolling is hurting your sleep or grades?
              </h2>
              <p className="welcome-desc">
                ScrollCheck compares your daily phone and sleep routine against <strong>705 real students</strong> using machine learning to estimate your burnout risk, match your closest data twin, and find the easiest detox fix.
              </p>
            </div>
            <div className="welcome-actions">
              <button
                type="button"
                className="vibe-check-btn"
                onClick={() => setQuizOpen(true)}
              >
                Check my own habits (15 sec)
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setShowIntro(false)}
              >
                Explore sample profile
              </button>
            </div>
          </div>

          <div className="welcome-steps">
            <div className="welcome-step">
              <strong>1. Set your routine</strong>
              <span>Take the 15-sec quiz or adjust the sliders on the left.</span>
            </div>
            <div className="welcome-step">
              <strong>2. Read your snapshot</strong>
              <span>See your Brain Battery, grade risk, and place among 705 students.</span>
            </div>
            <div className="welcome-step">
              <strong>3. Try a detox</strong>
              <span>Toggle power-ups or apply the smallest fix to reach Balanced.</span>
            </div>
          </div>
        </section>
      )}

      <main className="workspace">
        {/* LEFT INTERACTIVE LAB */}
        <aside className="panel control-rail" aria-label="Routine controls">
          <div className="rail-header">
            <h2 className="section-title">Tune your habits</h2>
            <div className="baseline-actions">
              <button type="button" className="ghost-btn" onClick={pinStartingPoint} disabled={!sim}>
                {baseline ? "Re-pin start" : "Pin start"}
              </button>
              {baseline && (
                <button type="button" className="ghost-btn" onClick={resetToBaseline}>
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Stackable Detox Power-Ups */}
          <div className="powerup-section">
            <div className="powerup-head">
              <span className="field-caption">Detox power-ups</span>
              {activePowerUps.length > 0 && (
                <button
                  type="button"
                  className="clear-powerups-btn"
                  onClick={() => setActivePowerUps([])}
                >
                  Clear ({activePowerUps.length})
                </button>
              )}
            </div>
            <p className="panel-subnote">
              Tap any real-life habit tweak to preview what happens if you try it this week.
            </p>
            <div className="powerup-grid">
              {POWER_UPS.map((p) => {
                const isOn = activePowerUps.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`powerup-chip ${isOn ? "is-on" : ""}`}
                    onClick={() => togglePowerUp(p.id)}
                    aria-pressed={isOn}
                  >
                    <strong>{p.label}</strong>
                    <span>{p.effect}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders (show effective value after power-ups) */}
          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="usage-slider">Daily scrolling</label>
              <span className="tabular-readout">
                {effectiveForm.daily_usage_hours.toFixed(1)} hrs
                {activePowerUps.length > 0 &&
                  effectiveForm.daily_usage_hours !== baseForm.daily_usage_hours && (
                    <em className="delta-inline"> (was {baseForm.daily_usage_hours.toFixed(1)}h)</em>
                  )}
              </span>
            </div>
            <div className="slider-wrap">
              <input
                id="usage-slider"
                type="range"
                min="1.5"
                max="9.0"
                step="0.1"
                value={baseForm.daily_usage_hours}
                onChange={(e) => updateBaseField("daily_usage_hours", parseFloat(e.target.value))}
              />
              <div className="slider-scale">
                <span>1.5h</span>
                <span className="threshold-tick" style={{ left: `${((5.5 - 1.5) / (9.0 - 1.5)) * 100}%` }}>
                  5.5h danger line
                </span>
                <span>9.0h</span>
              </div>
            </div>
          </div>

          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="sleep-slider">Nightly sleep</label>
              <span className="tabular-readout">
                {effectiveForm.sleep_hours.toFixed(1)} hrs
                {activePowerUps.length > 0 &&
                  effectiveForm.sleep_hours !== baseForm.sleep_hours && (
                    <em className="delta-inline"> (was {baseForm.sleep_hours.toFixed(1)}h)</em>
                  )}
              </span>
            </div>
            <div className="slider-wrap">
              <input
                id="sleep-slider"
                type="range"
                min="4.0"
                max="9.5"
                step="0.1"
                value={baseForm.sleep_hours}
                onChange={(e) => updateBaseField("sleep_hours", parseFloat(e.target.value))}
              />
              <div className="slider-scale">
                <span>4.0h</span>
                <span className="threshold-tick" style={{ left: `${((6.5 - 4.0) / (9.5 - 4.0)) * 100}%` }}>
                  6.5h minimum
                </span>
                <span>9.5h</span>
              </div>
            </div>
          </div>

          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="conflicts-slider">Phone drama &amp; tension</label>
              <span className="tabular-readout">{effectiveForm.conflicts} / 5</span>
            </div>
            <div className="slider-wrap">
              <input
                id="conflicts-slider"
                type="range"
                min="0"
                max="5"
                step="1"
                value={baseForm.conflicts}
                onChange={(e) => updateBaseField("conflicts", parseInt(e.target.value, 10))}
              />
              <div className="slider-scale">
                <span>0 chill</span>
                <span className="threshold-tick" style={{ left: `${(3 / 5) * 100}%` }}>
                  3+ hits grades
                </span>
                <span>5 nonstop</span>
              </div>
            </div>
          </div>

          <div className="control-group">
            <span className="field-caption">Main time-sink app</span>
            <div className="pill-grid">
              {(cohort.platforms?.length ? cohort.platforms : DEFAULT_PLATFORMS).map((plat) => (
                <button
                  key={plat}
                  type="button"
                  className={`choice-pill ${baseForm.platform === plat ? "is-selected" : ""}`}
                  onClick={() => updateBaseField("platform", plat)}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <span className="field-caption">Study stage</span>
            <div className="pill-row">
              {["High School", "Undergraduate", "Graduate"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`choice-pill ${baseForm.academic_level === lvl ? "is-selected" : ""}`}
                  onClick={() => updateBaseField("academic_level", lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="compact-selectors">
            <label className="mini-select">
              <span>Age</span>
              <input
                type="number"
                min="16"
                max="28"
                value={baseForm.age}
                onChange={(e) =>
                  updateBaseField("age", Math.max(16, Math.min(28, parseInt(e.target.value || "20", 10))))
                }
              />
            </label>
            <label className="mini-select">
              <span>Gender</span>
              <select value={baseForm.gender} onChange={(e) => updateBaseField("gender", e.target.value)}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="mini-select">
              <span>Status</span>
              <select
                value={baseForm.relationship_status}
                onChange={(e) => updateBaseField("relationship_status", e.target.value)}
              >
                <option value="Single">Single</option>
                <option value="In Relationship">In Relationship</option>
                <option value="Complicated">Complicated</option>
              </select>
            </label>
          </div>
        </aside>

        {/* RIGHT HERO STAGE + COHORT GALAXY */}
        <section className="canvas-column">
          {/* Expressive Hero Archetype Stage */}
          <div className="panel hero-stage">
            <div className="hero-left">
              <BrainBattery score={mhScore} persona={persona} />

              <div className="archetype-copy">
                <div className="badge-row">
                  <span className="source-chip">{profileSource}</span>
                  <span className={`persona-pill tone-${themeKey}`}>{persona}</span>
                  {baseline && (mhDelta !== 0 || riskDelta !== 0) && (
                    <span className="delta-chip">
                      {mhDelta >= 0 ? `+${mhDelta}` : mhDelta} well-being ·{" "}
                      {riskDelta > 0 ? `+${riskDelta}%` : `${riskDelta}%`} grade risk
                    </span>
                  )}
                </div>

                <h2 className="archetype-title">
                  {sim?.archetype?.title || "Checking your routine..."}
                </h2>
                <p className="archetype-tagline">
                  {sim?.archetype?.tagline || "Running live predictions on your habits."}
                </p>

                <div className="meter-strip">
                  <div className="meter-block">
                    <div className="meter-top">
                      <span>Mental well-being</span>
                      <strong className="tabular-readout">{mhScore.toFixed(1)} / 10</strong>
                    </div>
                    <div className="meter-track">
                      <div
                        className="meter-fill meter-fill-mh"
                        style={{ width: `${Math.min(100, Math.max(6, mhScore * 10))}%` }}
                      />
                    </div>
                    <span className="meter-hint">Predicted mood &amp; stress score (1–10)</span>
                  </div>

                  <div className="meter-block">
                    <div className="meter-top">
                      <span>Grade impact risk</span>
                      <strong className="tabular-readout">{riskPct}%</strong>
                    </div>
                    <div className="meter-track">
                      <div
                        className={`meter-fill ${riskPct >= 50 ? "meter-fill-danger" : "meter-fill-safe"}`}
                        style={{ width: `${Math.max(5, riskPct)}%` }}
                      />
                    </div>
                    <span className="meter-hint">Likelihood screen habits hurt studies</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-divider" aria-hidden="true" />

            <DayRing
              usageHours={effectiveForm.daily_usage_hours}
              sleepHours={effectiveForm.sleep_hours}
              semesterImpact={sim?.semester_impact || null}
            />
          </div>

          {/* 705-Student Galaxy + Real-World Twin */}
          <CohortMap
            students={cohort.students}
            centroids={cohort.centroids}
            userPoint={sim?.pca_point || null}
            baselinePoint={baseline?.result?.pca_point || null}
            nearestTwin={sim?.nearest_twin || null}
          />

          {/* Bottom Action Split */}
          <div className="insight-split">
            <div className="panel insight-panel">
              <h2 className="section-title">Smallest shift that works</h2>
              <p className="panel-subnote">
                Calculated by testing smaller daily tweaks until your profile enters the Balanced zone.
              </p>
              {sim?.minimum_fix ? (
                <div className="fix-content">
                  <p className="fix-summary">{sim.minimum_fix.summary}</p>
                  <div className="fix-projection">
                    <span>
                      Well-being jumps to{" "}
                      <strong>{sim.minimum_fix.projected_mental_health.toFixed(1)} / 10</strong> (+
                      {sim.minimum_fix.mental_health_gain.toFixed(1)})
                    </span>
                    <span>
                      Grade risk drops to{" "}
                      <strong>{Math.round(sim.minimum_fix.projected_risk_prob * 100)}%</strong>
                    </span>
                  </div>
                  <button type="button" className="primary-btn" onClick={tryMinimumFix}>
                    Apply smallest fix
                  </button>
                </div>
              ) : (
                <p className="fix-balanced-note">
                  You are already in the Balanced zone with low grade risk. Keep protecting your sleep window.
                </p>
              )}
            </div>

            <div className="panel insight-panel">
              <h2 className="section-title">Habit traps from the 705-student study</h2>
              <p className="panel-subnote">
                Risk patterns discovered in the real student dataset — red means active in your routine.
              </p>
              <ul className="rule-list">
                {(sim?.triggered_rules || []).map((rule) => (
                  <li key={rule.id} className={`rule-item ${rule.status === "active" ? "is-active" : "is-cleared"}`}>
                    <span className="rule-indicator" aria-hidden="true" />
                    <div>
                      <div className="rule-title-row">
                        <strong>{rule.title}</strong>
                        <span className="rule-state">
                          {rule.status === "active" ? "Active trap" : "Cleared"}
                        </span>
                      </div>
                      <p className="rule-evidence">{rule.evidence}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {cohort.model_stats && (
            <footer className="model-footnote">
              Live ML engine trained on 705 students — Ridge well-being (R² {cohort.model_stats.ridge_r2}), XGBoost grade risk (F1 {cohort.model_stats.xgb_f1}), and 3-group K-Means (silhouette {cohort.model_stats.kmeans_silhouette}).
            </footer>
          )}
        </section>
      </main>

      <QuickQuizModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}
