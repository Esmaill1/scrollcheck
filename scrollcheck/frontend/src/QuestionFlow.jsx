import { useState } from "react";
import BrandLogo from "./BrandLogo.jsx";

const PLATFORMS = [
  { id: "TikTok", sub: "Short-form loops" },
  { id: "Instagram", sub: "Reels & DMs" },
  { id: "YouTube", sub: "Videos & Shorts" },
  { id: "Snapchat", sub: "Snaps & streaks" },
  { id: "WhatsApp", sub: "Group chats" },
  { id: "Facebook", sub: "Feeds & groups" },
  { id: "Twitter", sub: "Scrolling threads" },
  { id: "LinkedIn", sub: "Career feeds" },
];

const USAGE_TIERS = [
  { label: "2.5h Light", value: 2.5 },
  { label: "4.5h Average", value: 4.5 },
  { label: "6.5h Heavy", value: 6.5 },
  { label: "8.0h Marathon", value: 8.0 },
];

const SLEEP_TIERS = [
  { label: "5.0h Exhausted", value: 5.0 },
  { label: "6.0h Short", value: 6.0 },
  { label: "7.0h Decent", value: 7.0 },
  { label: "8.0h Rested", value: 8.0 },
];

const TENSION_OPTIONS = [
  { value: 0, title: "0 — Never", sub: "Zero drama or stress from my phone" },
  { value: 1, title: "1 — Rarely", sub: "Once in a while, mostly harmless" },
  { value: 3, title: "3 — Weekly tension", sub: "Causes FOMO, distraction, or arguments" },
  { value: 4, title: "4 — Almost daily", sub: "Constantly pulls me away from sleep or study" },
];

const STUDY_STAGES = [
  { value: "High School", sub: "Ages 16–18" },
  { value: "Undergraduate", sub: "College / University" },
  { value: "Graduate", sub: "Master's / PhD" },
];

const TOTAL_STEPS = 5;

export default function QuestionFlow({ initialValues, onExit, onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    age: initialValues?.age ?? 20,
    daily_usage_hours: initialValues?.daily_usage_hours ?? 5.5,
    sleep_hours: initialValues?.sleep_hours ?? 6.2,
    conflicts: initialValues?.conflicts ?? 2,
    platform: initialValues?.platform ?? "TikTok",
    academic_level: initialValues?.academic_level ?? "Undergraduate",
    gender: initialValues?.gender ?? "Female",
    relationship_status: initialValues?.relationship_status ?? "Single",
  });

  const update = (key, val) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const daysPerYear = ((answers.daily_usage_hours * 365) / 24).toFixed(1);

  return (
    <div className="app-shell question-shell" data-theme="burnout">
      <div className="question-topbar">
        <button type="button" className="q-brand-btn" onClick={onExit} aria-label="Back to ScrollCheck home">
          <BrandLogo theme="burnout" size="sm" />
        </button>

        <span className="q-counter">
          Question {step + 1} of {TOTAL_STEPS}
        </span>

        <button type="button" className="ghost-btn" onClick={onExit}>
          Exit
        </button>
      </div>

      <div className="q-progress-wrap">
        <div className="q-progress-track">
          <div className="q-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <main className="question-stage">
        <div className="panel q-card" key={step}>
          {/* Step 1: App */}
          {step === 0 && (
            <div className="q-step-body">
              <h1 className="q-title">Which app steals most of your screen time?</h1>
              <p className="q-subtitle">Pick your #1 time-sink app — tapping moves right to the next step.</p>

              <div className="q-tile-grid">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`q-tile ${answers.platform === p.id ? "is-selected" : ""}`}
                    onClick={() => {
                      update("platform", p.id);
                      setStep(1);
                    }}
                  >
                    <strong>{p.id}</strong>
                    <span>{p.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Daily Scrolling */}
          {step === 1 && (
            <div className="q-step-body">
              <h1 className="q-title">Be honest — how many hours a day do you scroll?</h1>
              <p className="q-subtitle">Drag the slider or tap a quick preset below.</p>

              <div className="q-readout-box">
                <div className="tabular-readout q-big-readout">
                  {answers.daily_usage_hours.toFixed(1)} <span>hrs / day</span>
                </div>
                <div className="q-shock-pill">
                  That adds up to <strong>{daysPerYear} full days a year</strong> on your screen
                </div>
              </div>

              <div className="q-slider-wrap">
                <input
                  type="range"
                  min="1.5"
                  max="9.0"
                  step="0.1"
                  aria-label="Daily scrolling hours"
                  value={answers.daily_usage_hours}
                  onChange={(e) => update("daily_usage_hours", parseFloat(e.target.value))}
                />
                <div className="slider-scale">
                  <span>1.5h</span>
                  <span className="threshold-tick" style={{ left: `${((5.5 - 1.5) / (9.0 - 1.5)) * 100}%` }}>
                    5.5h danger line
                  </span>
                  <span>9.0h</span>
                </div>
              </div>

              <div className="q-quick-pills">
                {USAGE_TIERS.map((tier) => (
                  <button
                    key={tier.label}
                    type="button"
                    className={`q-quick-btn ${
                      Math.abs(answers.daily_usage_hours - tier.value) < 0.15 ? "is-selected" : ""
                    }`}
                    onClick={() => update("daily_usage_hours", tier.value)}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              <div className="q-nav-row">
                <button type="button" className="ghost-btn q-back" onClick={() => setStep(0)}>
                  Back
                </button>
                <button type="button" className="primary-btn q-next" onClick={() => setStep(2)}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Nightly Sleep */}
          {step === 2 && (
            <div className="q-step-body">
              <h1 className="q-title">How much sleep do you usually get on weeknights?</h1>
              <p className="q-subtitle">Sleep is the single biggest shield against screen burnout.</p>

              <div className="q-readout-box">
                <div className="tabular-readout q-big-readout">
                  {answers.sleep_hours.toFixed(1)} <span>hrs / night</span>
                </div>
                <div className={`q-shock-pill ${answers.sleep_hours >= 7.0 ? "is-good" : ""}`}>
                  {answers.sleep_hours < 6.5
                    ? "Under 6.5h starts compounding burnout and brain fog"
                    : answers.sleep_hours < 7.5
                    ? "Close to baseline — 7.5h+ gives full recovery"
                    : "Healthy recovery zone"}
                </div>
              </div>

              <div className="q-slider-wrap">
                <input
                  type="range"
                  min="4.0"
                  max="9.5"
                  step="0.1"
                  aria-label="Nightly sleep hours"
                  value={answers.sleep_hours}
                  onChange={(e) => update("sleep_hours", parseFloat(e.target.value))}
                />
                <div className="slider-scale">
                  <span>4.0h</span>
                  <span className="threshold-tick" style={{ left: `${((6.5 - 4.0) / (9.5 - 4.0)) * 100}%` }}>
                    6.5h minimum
                  </span>
                  <span>9.5h</span>
                </div>
              </div>

              <div className="q-quick-pills">
                {SLEEP_TIERS.map((tier) => (
                  <button
                    key={tier.label}
                    type="button"
                    className={`q-quick-btn ${
                      Math.abs(answers.sleep_hours - tier.value) < 0.15 ? "is-selected" : ""
                    }`}
                    onClick={() => update("sleep_hours", tier.value)}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              <div className="q-nav-row">
                <button type="button" className="ghost-btn q-back" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="button" className="primary-btn q-next" onClick={() => setStep(3)}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Phone Tension */}
          {step === 3 && (
            <div className="q-step-body">
              <h1 className="q-title">How often does social media cause stress, FOMO, or arguments?</h1>
              <p className="q-subtitle">High tension around your phone strongly predicts lower grades.</p>

              <div className="q-stack-options">
                {TENSION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`q-tile q-tile-wide ${answers.conflicts === opt.value ? "is-selected" : ""}`}
                    onClick={() => {
                      update("conflicts", opt.value);
                      setStep(4);
                    }}
                  >
                    <strong>{opt.title}</strong>
                    <span>{opt.sub}</span>
                  </button>
                ))}
              </div>

              <div className="q-nav-row">
                <button type="button" className="ghost-btn q-back" onClick={() => setStep(2)}>
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Profile & Reveal */}
          {step === 4 && (
            <div className="q-step-body">
              <h1 className="q-title">Last one — where are you in school?</h1>
              <p className="q-subtitle">Helps match your closest real-world student twin in our 705-student cohort.</p>

              <div className="q-stage-grid">
                {STUDY_STAGES.map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    className={`q-tile ${answers.academic_level === st.value ? "is-selected" : ""}`}
                    onClick={() => update("academic_level", st.value)}
                  >
                    <strong>{st.value}</strong>
                    <span>{st.sub}</span>
                  </button>
                ))}
              </div>

              <div className="q-profile-extras">
                <label className="mini-select">
                  <span>Age</span>
                  <input
                    type="number"
                    min="16"
                    max="28"
                    value={answers.age}
                    onChange={(e) =>
                      update("age", Math.max(16, Math.min(28, parseInt(e.target.value || "20", 10))))
                    }
                  />
                </label>
                <label className="mini-select">
                  <span>Gender</span>
                  <select value={answers.gender} onChange={(e) => update("gender", e.target.value)}>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="mini-select">
                  <span>Relationship</span>
                  <select
                    value={answers.relationship_status}
                    onChange={(e) => update("relationship_status", e.target.value)}
                  >
                    <option value="Single">Single</option>
                    <option value="In Relationship">In Relationship</option>
                    <option value="Complicated">Complicated</option>
                  </select>
                </label>
              </div>

              <div className="q-nav-row">
                <button type="button" className="ghost-btn q-back" onClick={() => setStep(3)}>
                  Back
                </button>
                <button type="button" className="primary-btn q-next" onClick={() => onComplete(answers)}>
                  Reveal my result
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
