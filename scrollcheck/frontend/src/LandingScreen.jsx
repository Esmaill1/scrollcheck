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
            Is your screen time quietly burning you out?
          </h1>

          <p className="landing-desc">
            Answer 5 quick questions about your phone and sleep habits. We compare you against{" "}
            <strong>705 real students</strong> using machine learning to reveal your burnout
            archetype, closest real-world twin, and the smallest fix that works.
          </p>

          <div className="landing-cta-row">
            <button type="button" className="landing-primary-btn" onClick={onStartQuiz}>
              Start my 15-sec check
            </button>
            <button type="button" className="landing-secondary-btn" onClick={onSkipToBoard}>
              Skip to interactive board
            </button>
          </div>

          <div className="landing-meta">
            <span>705 real students</span>
            <span>5 quick questions</span>
            <span>Live detox simulator</span>
          </div>
        </main>
      </div>
    </div>
  );
}
