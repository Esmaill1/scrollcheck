import { useEffect, useMemo, useState } from "react";
import AppIcon from "./AppIcon.jsx";
import BrainBattery from "./BrainBattery.jsx";
import BrandLogo from "./BrandLogo.jsx";
import CohortMap from "./CohortMap.jsx";
import DayRing from "./DayRing.jsx";
import LandingScreen from "./LandingScreen.jsx";
import QuestionFlow from "./QuestionFlow.jsx";

const PRESETS = [
  {
    id: "tiktok_spiral",
    label: "سهرة 2 الفجر",
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
    label: "أسبوع ميدترم",
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
    label: "صاحي بدري ورايق",
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
    label: "سيب الموبايل بره الأوضة",
    usageDelta: -1.2,
    sleepDelta: 0.9,
    conflictsDelta: 0,
  },
  {
    id: "no_reels",
    label: "اقفل الريلز لحد الجمعة",
    usageDelta: -1.8,
    sleepDelta: 0,
    conflictsDelta: 0,
  },
  {
    id: "mute_study",
    label: "ميوت للجروبات وقت المذاكرة",
    usageDelta: 0,
    sleepDelta: 0,
    conflictsDelta: -2,
  },
  {
    id: "lights_out",
    label: "نوم الساعة 11 بالليل",
    usageDelta: 0,
    sleepDelta: 1.5,
    conflictsDelta: 0,
  },
];

const PERSONA_AR = {
  Balanced: "متوازن ورايق",
  "Moderate Risk": "ضغط متوسط",
  "High Burnout Risk": "إرهاق عالي",
};

const STUDY_STAGE_BUTTONS = [
  { value: "High School", label: "ثانوي" },
  { value: "Undergraduate", label: "جامعة" },
  { value: "Graduate", label: "دراسات عليا" },
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
  const [stage, setStage] = useState("landing");
  const [baseForm, setBaseForm] = useState(PRESETS[0].values);
  const [activePowerUps, setActivePowerUps] = useState([]);
  const [cohort, setCohort] = useState({
    students: [],
    centroids: [],
    model_stats: null,
    platforms: DEFAULT_PLATFORMS,
  });
  const [sim, setSim] = useState(null);
  const [baseline, setBaseline] = useState(null);
  const [profileSource, setProfileSource] = useState("مثال: سهرة 2 الفجر");
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState(null);

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

  useEffect(() => {
    let active = true;
    fetch("/api/cohort")
      .then((res) => {
        if (!res.ok) throw new Error(`السيرفر رد بكود ${res.status}`);
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

  useEffect(() => {
    if (stage !== "board") return;
    let active = true;
    const timer = setTimeout(() => {
      fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(effectiveForm),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`حصل مشكلة في الحساب (${res.status})`);
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
  }, [effectiveForm, stage]);

  const handleQuizComplete = async (answers) => {
    setStage("analyzing");
    setActivePowerUps([]);
    setBaseForm(answers);
    setProfileSource("نتيجتك من الاختبار");

    const startedAt = Date.now();
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      if (!res.ok) throw new Error(`حصل مشكلة في الحساب (${res.status})`);
      const data = await res.json();

      const elapsed = Date.now() - startedAt;
      if (elapsed < 450) {
        await new Promise((r) => setTimeout(r, 450 - elapsed));
      }

      setSim(data);
      setBaseline({ baseForm: { ...answers }, activePowerUps: [], result: data });
      setApiError(null);
      setStage("board");
    } catch (err) {
      setApiError(err.message);
      setStage("board");
    }
  };

  const updateBaseField = (key, value) => {
    setProfileSource("روتينك المعدّل");
    setBaseForm((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset) => {
    setBaseline(null);
    setActivePowerUps([]);
    setProfileSource(`مثال: ${preset.label}`);
    setBaseForm(preset.values);
  };

  const togglePowerUp = (id) => {
    if (!baseline && sim) {
      setBaseline({ baseForm: { ...baseForm }, activePowerUps: [...activePowerUps], result: sim });
    }
    setProfileSource("روتينك المعدّل");
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
    setProfileSource("خطة التعديل المقترحة");
    setActivePowerUps([]);
    setBaseForm((prev) => ({
      ...prev,
      daily_usage_hours: sim.minimum_fix.target_usage_hours,
      sleep_hours: sim.minimum_fix.target_sleep_hours,
      conflicts: sim.minimum_fix.target_conflicts,
    }));
  };

  const copyWrappedSummary = () => {
    if (!sim) return;
    const summary = [
      `نتيجتي في ScrollCheck: ${sim.archetype?.title || PERSONA_AR[sim.persona]}`,
      `الروتين: ${effectiveForm.daily_usage_hours} س/يوم على ${effectiveForm.platform}، نوم ${effectiveForm.sleep_hours} س، توتر ${effectiveForm.conflicts}/5`,
      `النفسية: ${sim.mental_health_score}/10 | خطر على الدرجات: ${Math.round(sim.academic_risk_prob * 100)}%`,
      `إجمالي وقت الشاشة في السنة: ${sim.semester_impact?.days_per_year_scrolling} يوم كامل`,
    ].join("\n");
    navigator.clipboard?.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  if (stage === "landing") {
    return (
      <LandingScreen
        onStartQuiz={() => setStage("questions")}
        onSkipToBoard={() => {
          setBaseline(null);
          setActivePowerUps([]);
          setProfileSource(`مثال: ${PRESETS[0].label}`);
          setBaseForm(PRESETS[0].values);
          setStage("board");
        }}
      />
    );
  }

  if (stage === "questions") {
    return (
      <QuestionFlow
        initialValues={baseForm}
        onExit={() => setStage("landing")}
        onComplete={handleQuizComplete}
      />
    );
  }

  if (stage === "analyzing") {
    return (
      <div className="app-shell analyzing-shell" data-theme="moderate">
        <div className="analyzing-box">
          <div className="analyzing-spinner" aria-hidden="true" />
          <h2>بنقارن يومك بـ 705 طالب...</h2>
          <p>بنحسب مستوى الإرهاق وأقرب طالب شبهك.</p>
        </div>
      </div>
    );
  }

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
        <button
          type="button"
          className="brand-home-btn"
          onClick={() => setStage("landing")}
          aria-label="الرجوع لبداية ScrollCheck"
        >
          <BrandLogo theme={themeKey} size="md" />
        </button>

        <div className="topbar-actions">
          <button type="button" className="btn-ghost-sm" onClick={() => setStage("questions")}>
            عيد الاختبار
          </button>
          <button type="button" className="btn-ghost-sm" onClick={copyWrappedSummary} disabled={!sim}>
            {copied ? "اتنسخت" : "انسخ النتيجة"}
          </button>
        </div>
      </header>

      {apiError && (
        <div className="error-banner" role="alert">
          سيرفر الموديل مش شغال ({apiError}). اتأكد إن FastAPI شغال على بورت 8000.
        </div>
      )}

      <main className="workspace">
        {/* LEFT STREAMLINED CONTROLS */}
        <aside className="surface-card control-rail" aria-label="تعديل الروتين">
          <div className="rail-header">
            <h2 className="section-title">عدّل يومك</h2>
            <div className="baseline-actions">
              <button type="button" className="link-btn" onClick={pinStartingPoint} disabled={!sim}>
                {baseline ? "حدّث البداية" : "ثبّت البداية"}
              </button>
              {baseline && (
                <button type="button" className="link-btn" onClick={resetToBaseline}>
                  رجّع للأول
                </button>
              )}
            </div>
          </div>

          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="usage-slider">السكرول في اليوم</label>
              <span className="tabular-readout">
                {effectiveForm.daily_usage_hours.toFixed(1)} س
                {activePowerUps.length > 0 &&
                  effectiveForm.daily_usage_hours !== baseForm.daily_usage_hours && (
                    <em className="delta-inline"> (بدل {baseForm.daily_usage_hours.toFixed(1)})</em>
                  )}
              </span>
            </div>
            <div className="sleek-slider-wrap" dir="ltr">
              <input
                id="usage-slider"
                type="range"
                min="1.5"
                max="9.0"
                step="0.1"
                value={baseForm.daily_usage_hours}
                onChange={(e) => updateBaseField("daily_usage_hours", parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="sleep-slider">النوم بالليل</label>
              <span className="tabular-readout">
                {effectiveForm.sleep_hours.toFixed(1)} س
                {activePowerUps.length > 0 &&
                  effectiveForm.sleep_hours !== baseForm.sleep_hours && (
                    <em className="delta-inline"> (بدل {baseForm.sleep_hours.toFixed(1)})</em>
                  )}
              </span>
            </div>
            <div className="sleek-slider-wrap" dir="ltr">
              <input
                id="sleep-slider"
                type="range"
                min="4.0"
                max="9.5"
                step="0.1"
                value={baseForm.sleep_hours}
                onChange={(e) => updateBaseField("sleep_hours", parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="conflicts-slider">توتر السوشيال</label>
              <span className="tabular-readout">{effectiveForm.conflicts} / 5</span>
            </div>
            <div className="sleek-slider-wrap" dir="ltr">
              <input
                id="conflicts-slider"
                type="range"
                min="0"
                max="5"
                step="1"
                value={baseForm.conflicts}
                onChange={(e) => updateBaseField("conflicts", parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          {/* Sleek Detox Toggles */}
          <div className="powerup-section">
            <div className="powerup-head">
              <span className="field-caption">خطوات ديتوكس سريعة</span>
              {activePowerUps.length > 0 && (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setActivePowerUps([])}
                >
                  امسح ({activePowerUps.length})
                </button>
              )}
            </div>
            <div className="powerup-list">
              {POWER_UPS.map((p) => {
                const isOn = activePowerUps.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`powerup-toggle ${isOn ? "is-on" : ""}`}
                    onClick={() => togglePowerUp(p.id)}
                    aria-pressed={isOn}
                  >
                    <span className="toggle-dot" aria-hidden="true" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible Extras & Presets */}
          <details className="extras-accordion">
            <summary>تفاصيل إضافية وأمثلة جاهزة</summary>
            <div className="extras-body">
              <div className="control-group">
                <span className="field-caption">أمثلة جاهزة</span>
                <div className="pill-row">
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
                        className={`choice-pill ${isCurrent ? "is-selected" : ""}`}
                        onClick={() => applyPreset(p)}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="control-group">
                <span className="field-caption">الأبلكيشن الأساسي</span>
                <div className="pill-grid">
                  {(cohort.platforms?.length ? cohort.platforms : DEFAULT_PLATFORMS).map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      className={`choice-pill choice-pill-app ${baseForm.platform === plat ? "is-selected" : ""}`}
                      onClick={() => updateBaseField("platform", plat)}
                    >
                      <AppIcon name={plat} size={18} />
                      <span>{plat}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-group">
                <span className="field-caption">المرحلة الدراسية</span>
                <div className="pill-row">
                  {STUDY_STAGE_BUTTONS.map((lvl) => (
                    <button
                      key={lvl.value}
                      type="button"
                      className={`choice-pill ${baseForm.academic_level === lvl.value ? "is-selected" : ""}`}
                      onClick={() => updateBaseField("academic_level", lvl.value)}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="compact-selectors">
                <label className="mini-select">
                  <span>السن</span>
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
                  <span>النوع</span>
                  <select value={baseForm.gender} onChange={(e) => updateBaseField("gender", e.target.value)}>
                    <option value="Female">بنت</option>
                    <option value="Male">ولد</option>
                    <option value="Other">تاني</option>
                  </select>
                </label>
                <label className="mini-select">
                  <span>الحالة</span>
                  <select
                    value={baseForm.relationship_status}
                    onChange={(e) => updateBaseField("relationship_status", e.target.value)}
                  >
                    <option value="Single">سنجل</option>
                    <option value="In Relationship">مرتبط</option>
                    <option value="Complicated">معقدة شوية</option>
                  </select>
                </label>
              </div>
            </div>
          </details>
        </aside>

        {/* RIGHT SLEEK RESULT + COHORT BOARD */}
        <section className="canvas-column">
          <div className="surface-card hero-stage">
            <div className="hero-left">
              <BrainBattery score={mhScore} persona={persona} />

              <div className="archetype-copy">
                <div className="badge-row">
                  <span className={`status-badge tone-${themeKey}`}>
                    <i aria-hidden="true" />
                    {PERSONA_AR[persona] || persona}
                  </span>
                  <span className="source-label">{profileSource}</span>
                  {baseline && (mhDelta !== 0 || riskDelta !== 0) && (
                    <span className="delta-chip">
                      عن البداية: {mhDelta >= 0 ? `+${mhDelta}` : mhDelta} نفسية ·{" "}
                      {riskDelta > 0 ? `+${riskDelta}%` : `${riskDelta}%`} خطر
                    </span>
                  )}
                </div>

                <h1 className="archetype-title">
                  {sim?.archetype?.title || "بنحسب النتيجة..."}
                </h1>
                <p className="archetype-tagline">
                  {sim?.archetype?.tagline || "ثواني وهنطلعلك وضعك."}
                </p>

                <div className="meter-strip">
                  <div className="meter-block">
                    <div className="meter-top">
                      <span>نفسيتك المتوقعة</span>
                      <strong className="tabular-readout">{mhScore.toFixed(1)} / 10</strong>
                    </div>
                    <div className="meter-track">
                      <div
                        className="meter-fill meter-fill-mh"
                        style={{ width: `${Math.min(100, Math.max(6, mhScore * 10))}%` }}
                      />
                    </div>
                  </div>

                  <div className="meter-block">
                    <div className="meter-top">
                      <span>احتمال الدرجات تتأثر</span>
                      <strong className="tabular-readout">{riskPct}%</strong>
                    </div>
                    <div className="meter-track">
                      <div
                        className={`meter-fill ${riskPct >= 50 ? "meter-fill-danger" : "meter-fill-safe"}`}
                        style={{ width: `${Math.max(5, riskPct)}%` }}
                      />
                    </div>
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

          <CohortMap
            students={cohort.students}
            centroids={cohort.centroids}
            userPoint={sim?.pca_point || null}
            baselinePoint={baseline?.result?.pca_point || null}
            nearestTwin={sim?.nearest_twin || null}
          />

          <div className="insight-split">
            <div className="surface-card insight-panel">
              <h2 className="section-title">أقل تعديل يظبط الدنيا</h2>
              {sim?.minimum_fix ? (
                <div className="fix-content">
                  <p className="fix-summary">{sim.minimum_fix.summary}</p>
                  <p className="fix-projection">
                    نفسيتك هتوصل{" "}
                    <strong>{sim.minimum_fix.projected_mental_health.toFixed(1)}/10</strong>{" "}
                    وخطر الدرجات هينزل لـ{" "}
                    <strong>{Math.round(sim.minimum_fix.projected_risk_prob * 100)}%</strong>
                  </p>
                  <button type="button" className="btn-primary" onClick={tryMinimumFix}>
                    جرّب الروتين ده
                  </button>
                </div>
              ) : (
                <p className="fix-balanced-note">
                  أنت فعلًا في منطقة التوازن والخطر على درجاتك قليل.
                </p>
              )}
            </div>

            <div className="surface-card insight-panel">
              <h2 className="section-title">أهم الأنماط في البيانات</h2>
              <ul className="rule-list">
                {(sim?.triggered_rules || []).map((rule) => (
                  <li key={rule.id} className={`rule-row ${rule.status === "active" ? "is-active" : "is-cleared"}`}>
                    <span className="rule-dot" aria-hidden="true" />
                    <div className="rule-text">
                      <div className="rule-head-line">
                        <strong>{rule.title}</strong>
                        <span className="rule-state">
                          {rule.status === "active" ? "شغال" : "آمن"}
                        </span>
                      </div>
                      <span className="rule-evidence">{rule.evidence}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {cohort.model_stats && (
            <footer className="model-footnote">
              بيانات 705 طالب من 110 دولة — Ridge للنفسية (R² {cohort.model_stats.ridge_r2})، XGBoost للدرجات (F1 {cohort.model_stats.xgb_f1})، K-Means (silhouette {cohort.model_stats.kmeans_silhouette}).
            </footer>
          )}
        </section>
      </main>
    </div>
  );
}
