import { useState } from "react";
import BrainBattery from "./BrainBattery.jsx";
import BrandLogo from "./BrandLogo.jsx";

export default function LandingScreen({ onStartQuiz, onSkipToBoard, onBurst }) {
  const [charged, setCharged] = useState(false);

  const handleMascotTap = (e) => {
    const next = !charged;
    setCharged(next);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;
    if (next) {
      onBurst?.({ kind: "spark", x, y });
      onBurst?.({ kind: "float", x, y: y - 14, text: "+طاقة", tone: "positive" });
    } else {
      onBurst?.({ kind: "spark", x, y });
    }
  };

  return (
    <div className="app-shell landing-shell" data-theme="moderate">
      <div className="landing-container">
        <header className="landing-brand stagger-item stagger-1">
          <BrandLogo size="lg" />
        </header>

        <main className="landing-hero">
          <div className="landing-mascot stagger-item stagger-2">
            <BrainBattery
              score={charged ? 8.6 : 5.2}
              persona={charged ? "Balanced" : "Moderate Risk"}
              interactive
              onTap={handleMascotTap}
            />
          </div>

          <h1 className="landing-title stagger-item stagger-3">
            الموبايل ساحب يومك ولا لسه ماسك نفسك؟
          </h1>

          <p className="landing-desc stagger-item stagger-4">
            5 أسئلة سريعة عن وقت الموبايل ونومك نقارن بيهم يومك مع 705 طالب حقيقي، ونطلعلك وضعك ومين أكتر طالب شبهك وأقل تعديل يظبطلك يومك.
          </p>

          <div className="landing-cta-row stagger-item stagger-5">
            <button type="button" className="btn-primary btn-lg btn-dopamine" onClick={onStartQuiz}>
              اعمل الاختبار في 15 ثانية
            </button>
            <button type="button" className="btn-ghost" onClick={onSkipToBoard}>
              ادخل على البورد على طول
            </button>
          </div>
        </main>

        <footer className="landing-meta stagger-item stagger-5">
          <span>705 طالب من 110 دولة</span>
          <span>5 أسئلة</span>
          <span>محاكاة فورية</span>
        </footer>
      </div>
    </div>
  );
}
