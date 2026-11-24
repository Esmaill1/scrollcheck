import { useEffect, useRef, useState } from "react";
import BrandLogo from "./BrandLogo.jsx";
import AppIcon from "./AppIcon.jsx";

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

export default function QuestionFlow({ initialValues, onExit, onComplete, onBurst }) {
  const [step, setStep] = useState(0);
  const [stepDir, setStepDir] = useState("forward");
  const [justPicked, setJustPicked] = useState(null);
  const advanceTimerRef = useRef(null);

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

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const update = (key, val) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  const goToStep = (nextStep) => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setStepDir(nextStep >= step ? "forward" : "back");
    setJustPicked(null);
    setStep(nextStep);
  };

  const pickAndAdvance = (key, val, nextStep, e) => {
    update(key, val);
    setJustPicked(`${key}:${val}`);
    if (e?.clientX && e?.clientY) {
      onBurst?.({ kind: "spark", x: e.clientX, y: e.clientY });
    }
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      setStepDir("forward");
      setJustPicked(null);
      setStep(nextStep);
    }, 160);
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const daysPerYear = ((answers.daily_usage_hours * 365) / 24).toFixed(1);
  const usagePct = ((answers.daily_usage_hours - 1.5) / (9.0 - 1.5)) * 100;
  const sleepPct = ((answers.sleep_hours - 4.0) / (9.5 - 4.0)) * 100;

  return (
    <div className="app-shell question-shell" data-theme="moderate">
      <div className="edge-progress-track" aria-hidden="true">
        <div className="edge-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <header className="question-topbar">
        <button type="button" className="q-brand-btn" onClick={onExit} aria-label="رجوع للرئيسية">
          <BrandLogo size="sm" />
        </button>

        <span key={step} className="q-counter">
          سؤال {step + 1} من {TOTAL_STEPS}
        </span>

        <button type="button" className="btn-ghost-sm" onClick={onExit}>
          خروج
        </button>
      </header>

      <main className="question-stage">
        <div className={`q-open-container dir-${stepDir}`} key={step}>
          {step === 0 && (
            <div className="q-step-body">
              <h1 className="q-title">أكتر أبلكيشن بياكل وقتك إيه؟</h1>
              <p className="q-subtitle">اختار الأبلكيشن اللي بتفتحه أكتر حاجة.</p>

              <div className="q-tile-grid">
                {PLATFORMS.map((p) => {
                  const selected = answers.platform === p.id;
                  const picking = justPicked === `platform:${p.id}`;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`q-tile q-tile-app ${selected ? "is-selected" : ""} ${
                        picking ? "is-just-picked" : ""
                      }`}
                      onClick={(e) => pickAndAdvance("platform", p.id, 1, e)}
                    >
                      <AppIcon name={p.id} size={34} />
                      <div className="q-tile-text">
                        <strong>{p.id}</strong>
                        <span>{p.sub}</span>
                      </div>
                    </button>
                  );
                })}
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
                  style={{ "--slider-pct": `${usagePct.toFixed(1)}%` }}
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
                    onClick={(e) => {
                      update("daily_usage_hours", tier.value);
                      if (e.clientX && e.clientY) {
                        onBurst?.({ kind: "spark", x: e.clientX, y: e.clientY });
                      }
                    }}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              <div className="q-nav-row">
                <button type="button" className="btn-ghost-sm" onClick={() => goToStep(0)}>
                  رجوع
                </button>
                <button type="button" className="btn-primary btn-dopamine" onClick={() => goToStep(2)}>
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
                  style={{ "--slider-pct": `${sleepPct.toFixed(1)}%` }}
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
                    onClick={(e) => {
                      update("sleep_hours", tier.value);
                      if (e.clientX && e.clientY) {
                        onBurst?.({ kind: "spark", x: e.clientX, y: e.clientY });
                      }
                    }}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              <div className="q-nav-row">
                <button type="button" className="btn-ghost-sm" onClick={() => goToStep(1)}>
                  رجوع
                </button>
                <button type="button" className="btn-primary btn-dopamine" onClick={() => goToStep(3)}>
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
                {TENSION_OPTIONS.map((opt) => {
                  const selected = answers.conflicts === opt.value;
                  const picking = justPicked === `conflicts:${opt.value}`;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`q-tile ${selected ? "is-selected" : ""} ${
                        picking ? "is-just-picked" : ""
                      }`}
                      onClick={(e) => pickAndAdvance("conflicts", opt.value, 4, e)}
                    >
                      <strong>{opt.title}</strong>
                      <span>{opt.sub}</span>
                    </button>
                  );
                })}
              </div>

              <div className="q-nav-row">
                <button type="button" className="btn-ghost-sm" onClick={() => goToStep(2)}>
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
                    onClick={(e) => {
                      update("academic_level", st.value);
                      if (e.clientX && e.clientY) {
                        onBurst?.({ kind: "spark", x: e.clientX, y: e.clientY });
                      }
                    }}
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
                <button type="button" className="btn-ghost-sm" onClick={() => goToStep(3)}>
                  رجوع
                </button>
                <button
                  type="button"
                  className="btn-primary btn-dopamine"
                  onClick={(e) => {
                    if (e.clientX && e.clientY) {
                      onBurst?.({ kind: "spark", x: e.clientX, y: e.clientY });
                    }
                    onComplete(answers);
                  }}
                >
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
