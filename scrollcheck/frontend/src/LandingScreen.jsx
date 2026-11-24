import BrainBattery from "./BrainBattery.jsx";
import BrandLogo from "./BrandLogo.jsx";

export default function LandingScreen({ onStartQuiz, onSkipToBoard }) {
  return (
    <div className="app-shell landing-shell" data-theme="burnout">
      <div className="landing-container">
        <header className="landing-brand">
          <BrandLogo theme="burnout" size="lg" />
        </header>

        <main className="landing-hero">
          <div className="landing-mascot">
            <BrainBattery score={5.2} persona="Moderate Risk" />
          </div>

          <h1 className="landing-title">
            الموبايل ساحب يومك ولا لسه ماسك نفسك؟
          </h1>

          <p className="landing-desc">
            جاوب على 5 أسئلة سريعة عن وقت الموبايل ونومك. بنقارن يومك بـ{" "}
            <strong>705 طالب حقيقي</strong>، ونقولك وضعك فين، ومين أكتر طالب شبهك في البيانات،
            وإيه أقل تعديل يظبط نومك ودرجاتك.
          </p>

          <div className="landing-cta-row">
            <button type="button" className="landing-primary-btn" onClick={onStartQuiz}>
              اعمل الاختبار في 15 ثانية
            </button>
            <button type="button" className="landing-secondary-btn" onClick={onSkipToBoard}>
              ادخل على البورد على طول
            </button>
          </div>

          <div className="landing-meta">
            <span>705 طالب حقيقي</span>
            <span>5 أسئلة سريعة</span>
            <span>جرّب التعديل بنفسك</span>
          </div>
        </main>
      </div>
    </div>
  );
}
