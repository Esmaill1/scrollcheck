import { useEffect, useState } from "react";
import CohortMap from "./CohortMap.jsx";

const PRESETS = [
  {
    id: "late_night",
    label: "Late-night scroller",
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
    id: "midterm",
    label: "Midterm crunch",
    values: {
      age: 20,
      daily_usage_hours: 5.1,
      sleep_hours: 6.4,
      conflicts: 2,
      platform: "Instagram",
      academic_level: "Undergraduate",
      gender: "Male",
      relationship_status: "Single",
    },
  },
  {
    id: "rested",
    label: "Rested routine",
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

const PERSONA_META = {
  Balanced: {
    className: "tone-balanced",
    headline: "Your current routine keeps burnout pressure low.",
  },
  "Moderate Risk": {
    className: "tone-moderate",
    headline: "Your habits are drifting into moderate strain.",
  },
  "High Burnout Risk": {
    className: "tone-burnout",
    headline: "Screen time and lost sleep are compounding your burnout risk.",
  },
};

export default function App() {
  const [form, setForm] = useState(PRESETS[0].values);
  const [cohort, setCohort] = useState({
    students: [],
    centroids: [],
    model_stats: null,
    platforms: DEFAULT_PLATFORMS,
  });
  const [sim, setSim] = useState(null);
  const [baseline, setBaseline] = useState(null); // { values, result }
  const [apiError, setApiError] = useState(null);

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

  // Re-simulate cleanly on slider or pill change (debounced slightly for rapid drag)
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
    }, 65);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [form]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (presetValues) => {
    setBaseline(null);
    setForm(presetValues);
  };

  const pinStartingPoint = () => {
    if (!sim) return;
    setBaseline({ values: { ...form }, result: sim });
  };

  const resetToBaseline = () => {
    if (!baseline) return;
    setForm(baseline.values);
  };

  const tryMinimumFix = () => {
    if (!sim?.minimum_fix) return;
    if (!baseline) {
      setBaseline({ values: { ...form }, result: sim });
    }
    setForm((prev) => ({
      ...prev,
      daily_usage_hours: sim.minimum_fix.target_usage_hours,
      sleep_hours: sim.minimum_fix.target_sleep_hours,
      conflicts: sim.minimum_fix.target_conflicts,
    }));
  };

  const persona = sim?.persona || "Moderate Risk";
  const personaStyle = PERSONA_META[persona] || PERSONA_META["Moderate Risk"];
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
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <h1 className="brand-name">ScrollCheck</h1>
            <p className="brand-subtitle">
              See how daily screen time and sleep shift your well-being among 705 students
            </p>
          </div>
        </div>

        <div className="preset-strip" role="group" aria-label="Sample student routines">
          {PRESETS.map((p) => {
            const isCurrent =
              form.daily_usage_hours === p.values.daily_usage_hours &&
              form.sleep_hours === p.values.sleep_hours &&
              form.conflicts === p.values.conflicts &&
              form.platform === p.values.platform;
            return (
              <button
                key={p.id}
                type="button"
                className={`preset-btn ${isCurrent ? "is-active" : ""}`}
                onClick={() => applyPreset(p.values)}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </header>

      {apiError && (
        <div className="error-banner" role="alert">
          Unable to reach the ScrollCheck model service ({apiError}). Start the FastAPI server on port 8000 and refresh.
        </div>
      )}

      <main className="workspace">
        {/* LEFT CONTROL RAIL */}
        <aside className="control-rail" aria-label="Routine controls">
          <div className="rail-header">
            <h2 className="section-title">Your daily routine</h2>
            <div className="baseline-actions">
              <button type="button" className="ghost-btn" onClick={pinStartingPoint} disabled={!sim}>
                {baseline ? "Update start" : "Pin as starting point"}
              </button>
              {baseline && (
                <button type="button" className="ghost-btn" onClick={resetToBaseline}>
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Screen Time Slider */}
          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="usage-slider">Daily social media time</label>
              <span className="tabular-readout">{form.daily_usage_hours.toFixed(1)} hrs</span>
            </div>
            <div className="slider-wrap">
              <input
                id="usage-slider"
                type="range"
                min="1.5"
                max="9.0"
                step="0.1"
                value={form.daily_usage_hours}
                onChange={(e) => updateField("daily_usage_hours", parseFloat(e.target.value))}
              />
              <div className="slider-scale">
                <span>1.5h</span>
                <span className="threshold-tick" style={{ left: `${((5.5 - 1.5) / (9.0 - 1.5)) * 100}%` }}>
                  5.5h risk line
                </span>
                <span>9.0h</span>
              </div>
            </div>
          </div>

          {/* Sleep Slider */}
          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="sleep-slider">Nightly sleep</label>
              <span className="tabular-readout">{form.sleep_hours.toFixed(1)} hrs</span>
            </div>
            <div className="slider-wrap">
              <input
                id="sleep-slider"
                type="range"
                min="4.0"
                max="9.5"
                step="0.1"
                value={form.sleep_hours}
                onChange={(e) => updateField("sleep_hours", parseFloat(e.target.value))}
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

          {/* Conflicts Slider */}
          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="conflicts-slider">Social media tension or arguments</label>
              <span className="tabular-readout">{form.conflicts} / 5</span>
            </div>
            <div className="slider-wrap">
              <input
                id="conflicts-slider"
                type="range"
                min="0"
                max="5"
                step="1"
                value={form.conflicts}
                onChange={(e) => updateField("conflicts", parseInt(e.target.value, 10))}
              />
              <div className="slider-scale">
                <span>0 none</span>
                <span className="threshold-tick" style={{ left: `${(3 / 5) * 100}%` }}>
                  3+ strain
                </span>
                <span>5 frequent</span>
              </div>
            </div>
          </div>

          {/* Most-Used App Pills */}
          <div className="control-group">
            <span className="field-caption">Most-used app</span>
            <div className="pill-grid">
              {(cohort.platforms?.length ? cohort.platforms : DEFAULT_PLATFORMS).map((plat) => (
                <button
                  key={plat}
                  type="button"
                  className={`choice-pill ${form.platform === plat ? "is-selected" : ""}`}
                  onClick={() => updateField("platform", plat)}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>

          {/* Study Stage */}
          <div className="control-group">
            <span className="field-caption">Study stage</span>
            <div className="pill-row">
              {["High School", "Undergraduate", "Graduate"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`choice-pill ${form.academic_level === lvl ? "is-selected" : ""}`}
                  onClick={() => updateField("academic_level", lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Age, Gender, Relationship */}
          <div className="compact-selectors">
            <label className="mini-select">
              <span>Age</span>
              <input
                type="number"
                min="16"
                max="28"
                value={form.age}
                onChange={(e) => updateField("age", Math.max(16, Math.min(28, parseInt(e.target.value || "20", 10))))}
              />
            </label>
            <label className="mini-select">
              <span>Gender</span>
              <select value={form.gender} onChange={(e) => updateField("gender", e.target.value)}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="mini-select">
              <span>Relationship</span>
              <select
                value={form.relationship_status}
                onChange={(e) => updateField("relationship_status", e.target.value)}
              >
                <option value="Single">Single</option>
                <option value="In Relationship">In Relationship</option>
                <option value="Complicated">Complicated</option>
              </select>
            </label>
          </div>
        </aside>

        {/* RIGHT DIAGNOSIS + COHORT CANVAS */}
        <section className="canvas-column">
          {/* Dynamic Diagnosis Strip */}
          <div className={`diagnosis-panel ${personaStyle.className}`}>
            <div className="diagnosis-headline-row">
              <div>
                <span className={`persona-badge ${personaStyle.className}`}>{persona}</span>
                <h2 className="diagnosis-headline">{personaStyle.headline}</h2>
              </div>
              {baseline && (mhDelta !== 0 || riskDelta !== 0) && (
                <div className="delta-chip">
                  <span>From start: </span>
                  <strong>
                    {mhDelta >= 0 ? `+${mhDelta}` : mhDelta} well-being, {riskDelta > 0 ? `+${riskDelta}%` : `${riskDelta}%`} grade risk
                  </strong>
                </div>
              )}
            </div>

            <div className="meter-strip">
              <div className="meter-block">
                <div className="meter-top">
                  <span>Predicted mental well-being</span>
                  <strong className="tabular-readout">{mhScore.toFixed(1)} / 10</strong>
                </div>
                <div className="meter-track">
                  <div
                    className="meter-fill meter-fill-mh"
                    style={{ width: `${Math.min(100, Math.max(5, mhScore * 10))}%` }}
                  />
                </div>
              </div>

              <div className="meter-block">
                <div className="meter-top">
                  <span>Chance grades take a hit</span>
                  <strong className="tabular-readout">{riskPct}%</strong>
                </div>
                <div className="meter-track">
                  <div
                    className={`meter-fill ${riskPct >= 50 ? "meter-fill-danger" : "meter-fill-safe"}`}
                    style={{ width: `${Math.max(4, riskPct)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Centerpiece Cohort Map */}
          <CohortMap
            students={cohort.students}
            centroids={cohort.centroids}
            userPoint={sim?.pca_point || null}
            userPersona={persona}
            baselinePoint={baseline?.result?.pca_point || null}
          />

          {/* Bottom Split: Minimum Fix + Empirical Habit Triggers */}
          <div className="insight-split">
            <div className="insight-panel">
              <h2 className="section-title">Smallest change that works</h2>
              {sim?.minimum_fix ? (
                <div className="fix-content">
                  <p className="fix-summary">{sim.minimum_fix.summary}</p>
                  <div className="fix-projection">
                    <span>
                      Projected well-being:{" "}
                      <strong>{sim.minimum_fix.projected_mental_health.toFixed(1)} / 10</strong> (
                      +{sim.minimum_fix.mental_health_gain.toFixed(1)})
                    </span>
                    <span>
                      Projected grade risk:{" "}
                      <strong>{Math.round(sim.minimum_fix.projected_risk_prob * 100)}%</strong>
                    </span>
                  </div>
                  <button type="button" className="primary-btn" onClick={tryMinimumFix}>
                    Try this routine
                  </button>
                </div>
              ) : (
                <p className="fix-balanced-note">
                  You are already in the Balanced group with low academic risk. Keep screen time steady and protect your sleep window.
                </p>
              )}
            </div>

            <div className="insight-panel">
              <h2 className="section-title">Habit patterns from the study</h2>
              <ul className="rule-list">
                {(sim?.triggered_rules || []).map((rule) => (
                  <li key={rule.id} className={`rule-item ${rule.status === "active" ? "is-active" : "is-cleared"}`}>
                    <span className="rule-indicator" aria-hidden="true" />
                    <div>
                      <div className="rule-title-row">
                        <strong>{rule.title}</strong>
                        <span className="rule-state">
                          {rule.status === "active" ? "Triggered" : "Cleared"}
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
              Trained on 705 students: Ridge mental-health predictor (R² {cohort.model_stats.ridge_r2}), XGBoost academic risk classifier (F1 {cohort.model_stats.xgb_f1}), and 3-group K-Means clustering (silhouette {cohort.model_stats.kmeans_silhouette}).
            </footer>
          )}
        </section>
      </main>
    </div>
  );
}
