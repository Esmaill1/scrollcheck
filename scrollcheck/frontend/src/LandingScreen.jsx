import { useRef, useState } from "react";
import BrainBattery from "./BrainBattery.jsx";
import BrandLogo from "./BrandLogo.jsx";

export default function LandingScreen({
  onStartQuiz,
  onSkipToBoard,
  onBurst,
  supercharged = false,
  onTurboTrigger,
  unlockedCount = 0,
  onOpenVault,
}) {
  const [charged, setCharged] = useState(false);
  const tapTimesRef = useRef([]);
  const footerTapTimesRef = useRef([]);

  const handleMascotTap = (e) => {
    const now = Date.now();
    const recent = tapTimesRef.current.filter((t) => now - t < 2500);
    recent.push(now);
    tapTimesRef.current = recent;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;

    if (recent.length >= 5) {
      tapTimesRef.current = [];
      onTurboTrigger?.(x, y);
      return;
    }

    const next = !charged;
    setCharged(next);
    if (next) {
      onBurst?.({ kind: "spark", x, y });
      onBurst?.({ kind: "float", x, y: y - 14, text: "+طاقة", tone: "positive" });
    } else {
      onBurst?.({ kind: "spark", x, y });
    }
  };

  const handleMetaTap = () => {
    const now = Date.now();
    const recent = footerTapTimesRef.current.filter((t) => now - t < 1800);
    recent.push(now);
    footerTapTimesRef.current = recent;
    if (recent.length >= 3) {
      footerTapTimesRef.current = [];
      onOpenVault?.();
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
              supercharged={supercharged}
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
          <button
            type="button"
            className="meta-secret-btn"
            onClick={handleMetaTap}
          >
            705 طالب من 110 دولة
          </button>
          <span>5 أسئلة</span>
          <span>محاكاة فورية</span>
          {unlockedCount > 0 && (
            <button type="button" className="egg-pill-btn" onClick={onOpenVault}>
              أسرار {unlockedCount}/5
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
