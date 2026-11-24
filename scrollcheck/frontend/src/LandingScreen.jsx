import BrainBattery from "./BrainBattery.jsx";
import BrandLogo from "./BrandLogo.jsx";

export default function LandingScreen({ onStartQuiz, onSkipToBoard }) {
  return (
    <div className="app-shell landing-shell" data-theme="moderate">
      <div className="landing-container">
        <header className="landing-brand">
          <BrandLogo size="lg" />
        </header>

        <main className="landing-hero">
          <div className="landing-mascot">
            <BrainBattery score={5.2} persona="Moderate Risk" />
          </div>

          <h1 className="landing-title">
            الموبايل ساحب يومك ولا لسه ماسك نفسك؟
          </h1>

          <p className="landing-desc">
            5 أسئلة سريعة عن وقت الموبايل ونومك نقارن بيهم يومك مع 705 طالب حقيقي، ونطلعلك وضعك ومين أكتر طالب شبهك وأقل تعديل يظبطلك يومك.
          </p>

          <div className="landing-cta-row">
            <button type="button" className="btn-primary btn-lg" onClick={onStartQuiz}>
              اعمل الاختبار في 15 ثانية
            </button>
            <button type="button" className="btn-ghost" onClick={onSkipToBoard}>
              ادخل على البورد على طول
            </button>
          </div>
        </main>

        <footer className="landing-meta">
          <span>705 طالب من 110 دولة</span>
          <span>5 أسئلة</span>
          <span>محاكاة فورية</span>
        </footer>
      </div>
    </div>
  );
}
