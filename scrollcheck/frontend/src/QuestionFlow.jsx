import { useState } from "react";
import BrandLogo from "./BrandLogo.jsx";

const PLATFORMS = [
  { id: "TikTok", sub: "فيديوهات بتسحب بعض" },
  { id: "Instagram", sub: "ريلز ورسايل" },
  { id: "YouTube", sub: "فيديوهات وشورتس" },
  { id: "Snapchat", sub: "ستريكات وستوريز" },
  { id: "WhatsApp", sub: "جروبات وشات" },
  { id: "Facebook", sub: "بوستات وتقليب" },
  { id: "Twitter", sub: "ثريدز وتريندات" },
  { id: "LinkedIn", sub: "شغل وبوستات" },
];

const USAGE_TIERS = [
  { label: "2.5 س خفيف", value: 2.5 },
  { label: "4.5 س عادي", value: 4.5 },
  { label: "6.5 س كتير", value: 6.5 },
  { label: "8.0 س مابتسيبوش", value: 8.0 },
];

const SLEEP_TIERS = [
  { label: "5.0 س مسحول", value: 5.0 },
  { label: "6.0 س قليل", value: 6.0 },
  { label: "7.0 س معقول", value: 7.0 },
  { label: "8.0 س شبعان نوم", value: 8.0 },
];

const TENSION_OPTIONS = [
  { value: 0, title: "0 — ولا مرة", sub: "الموبايل مش عامل أي قلق أو شد في يومي" },
  { value: 1, title: "1 — نادرًا", sub: "حاجة بسيطة بتعدي من غير تأثير" },
  { value: 3, title: "3 — كل أسبوع", sub: "بيعملي توتر أو تشتيت أو خناقات أحيانًا" },
  { value: 4, title: "4 — تقريبًا كل يوم", sub: "ساحبني من النوم والمذاكرة طول الوقت" },
];

const STUDY_STAGES = [
  { value: "High School", label: "ثانوي", sub: "16 – 18 سنة" },
  { value: "Undergraduate", label: "جامعة", sub: "بكالوريوس / ليسانس" },
  { value: "Graduate", label: "دراسات عليا", sub: "ماجستير / دكتوراه" },
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
      <div className="edge-progress-track" aria-hidden="true">
        <div className="edge-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <header className="question-topbar">
        <button type="button" className="q-brand-btn" onClick={onExit} aria-label="رجوع للرئيسية">
          <BrandLogo theme="burnout" size="sm" />
        </button>

        <span className="q-counter">
          {step + 1} / {TOTAL_STEPS}
        </span>

        <button type="button" className="btn-ghost-sm" onClick={onExit}>
          خروج
        </button>
      </header>

      <main className="question-stage">
        <div className="q-open-container" key={step}>
          {step === 0 && (
            <div className="q-step-body">
              <h1 className="q-title">أكتر أبلكيشن بياكل وقتك إيه؟</h1>
              <p className="q-subtitle">اختار الأبلكيشن اللي بتفتحه أكتر حاجة.</p>

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

          {step === 1 && (
            <div className="q-step-body">
              <h1 className="q-title">بتقعد كام ساعة في اليوم على السوشيال؟</h1>
              <p className="q-subtitle">حرّك السلايدر أو اختار أقرب رقم ليومك.</p>

              <div className="q-readout-inline">
                <div className="tabular-readout q-big-readout">
                  {answers.daily_usage_hours.toFixed(1)} <span>ساعة</span>
                </div>
                <p className="q-inline-hint">
                  يعني حوالي {daysPerYear} يوم كامل في السنة على الشاشة
                </p>
              </div>

              <div className="sleek-slider-wrap" dir="ltr">
                <input
                  type="range"
                  min="1.5"
                  max="9.0"
                  step="0.1"
                  aria-label="ساعات السكرول اليومية"
                  value={answers.daily_usage_hours}
                  onChange={(e) => update("daily_usage_hours", parseFloat(e.target.value))}
                />
                <div className="slider-ends">
                  <span>1.5 س</span>
                  <span>الحد الآمن ~5.5 س</span>
                  <span>9.0 س</span>
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
                <button type="button" className="btn-ghost-sm" onClick={() => setStep(0)}>
                  رجوع
                </button>
                <button type="button" className="btn-primary" onClick={() => setStep(2)}>
                  اللي بعده
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="q-step-body">
              <h1 className="q-title">بتنام كام ساعة في أيام الدراسة؟</h1>
              <p className="q-subtitle">النوم هو أكتر حاجة بتحميك من الإرهاق وتشتيت المذاكرة.</p>

              <div className="q-readout-inline">
                <div className="tabular-readout q-big-readout">
                  {answers.sleep_hours.toFixed(1)} <span>ساعة</span>
                </div>
                <p className={`q-inline-hint ${answers.sleep_hours >= 7.0 ? "is-good" : "is-warn"}`}>
                  {answers.sleep_hours < 6.5
                    ? "أقل من 6.5 ساعات بيراكم إرهاق وتشتيت تاني يوم"
                    : answers.sleep_hours < 7.5
                    ? "قريب من المعقول، بس 7.5 ساعات بتفرق في التركيز"
                    : "نوم مظبوط وبيديك طاقة تاني يوم"}
                </p>
              </div>

              <div className="sleek-slider-wrap" dir="ltr">
                <input
                  type="range"
                  min="4.0"
                  max="9.5"
                  step="0.1"
                  aria-label="ساعات النوم"
                  value={answers.sleep_hours}
                  onChange={(e) => update("sleep_hours", parseFloat(e.target.value))}
                />
                <div className="slider-ends">
                  <span>4.0 س</span>
                  <span>الموصى به 6.5+ س</span>
                  <span>9.5 س</span>
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
                <button type="button" className="btn-ghost-sm" onClick={() => setStep(1)}>
                  رجوع
                </button>
                <button type="button" className="btn-primary" onClick={() => setStep(3)}>
                  اللي بعده
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="q-step-body">
              <h1 className="q-title">الموبايل بيعملك توتر أو خناقات قد إيه؟</h1>
              <p className="q-subtitle">التوتر بسبب السوشيال ليه علاقة مباشرة بهبوط الدرجات.</p>

              <div className="q-stack-options">
                {TENSION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`q-tile ${answers.conflicts === opt.value ? "is-selected" : ""}`}
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
                <button type="button" className="btn-ghost-sm" onClick={() => setStep(2)}>
                  رجوع
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="q-step-body">
              <h1 className="q-title">آخر سؤال.. أنت في مرحلة إيه؟</h1>
              <p className="q-subtitle">عشان نطلعلك أقرب طالب شبهك وسط الـ 705 طالب.</p>

              <div className="q-stage-grid">
                {STUDY_STAGES.map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    className={`q-tile ${answers.academic_level === st.value ? "is-selected" : ""}`}
                    onClick={() => update("academic_level", st.value)}
                  >
                    <strong>{st.label}</strong>
                    <span>{st.sub}</span>
                  </button>
                ))}
              </div>

              <div className="q-profile-extras">
                <label className="mini-select">
                  <span>السن</span>
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
                  <span>النوع</span>
                  <select value={answers.gender} onChange={(e) => update("gender", e.target.value)}>
                    <option value="Female">بنت</option>
                    <option value="Male">ولد</option>
                    <option value="Other">تاني</option>
                  </select>
                </label>
                <label className="mini-select">
                  <span>الحالة</span>
                  <select
                    value={answers.relationship_status}
                    onChange={(e) => update("relationship_status", e.target.value)}
                  >
                    <option value="Single">سنجل</option>
                    <option value="In Relationship">مرتبط</option>
                    <option value="Complicated">معقدة شوية</option>
                  </select>
                </label>
              </div>

              <div className="q-nav-row">
                <button type="button" className="btn-ghost-sm" onClick={() => setStep(3)}>
                  رجوع
                </button>
                <button type="button" className="btn-primary" onClick={() => onComplete(answers)}>
                  وريني النتيجة
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
