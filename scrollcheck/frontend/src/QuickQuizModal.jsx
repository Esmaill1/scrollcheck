import { useState } from "react";

const STEPS = [
  {
    key: "platform",
    question: "Which app steals most of your attention?",
    options: [
      { label: "TikTok", sub: "Short-form loops", value: "TikTok" },
      { label: "Instagram", sub: "Reels & DMs", value: "Instagram" },
      { label: "YouTube", sub: "Long & Shorts", value: "YouTube" },
      { label: "Snapchat / WhatsApp", sub: "Non-stop streaks", value: "Snapchat" },
    ],
  },
  {
    key: "daily_usage_hours",
    question: "Be honest — how many hours do you scroll a day?",
    options: [
      { label: "Light (~2.5 hrs)", sub: "Quick check-ins only", value: 2.5 },
      { label: "Average (~4.5 hrs)", sub: "Between classes & bus", value: 4.5 },
      { label: "Heavy (~6.2 hrs)", sub: "Hours disappear fast", value: 6.2 },
      { label: "Marathon (~7.8 hrs)", sub: "Practically a part-time job", value: 7.8 },
    ],
  },
  {
    key: "sleep_hours",
    question: "How much sleep do you usually get on weeknights?",
    options: [
      { label: "Under 5.5 hrs", sub: "Running on fumes", value: 5.2 },
      { label: "Around 6.2 hrs", sub: "One more video trap", value: 6.2 },
      { label: "About 7.2 hrs", sub: "Pretty decent rest", value: 7.2 },
      { label: "8+ hours", sub: "Well-rested legend", value: 8.2 },
    ],
  },
  {
    key: "conflicts",
    question: "How often does your phone cause stress, FOMO, or arguments?",
    options: [
      { label: "Never (0)", sub: "Zero drama", value: 0 },
      { label: "Rarely (1)", sub: "Once in a while", value: 1 },
      { label: "Sometimes (3)", sub: "Weekly tension", value: 3 },
      { label: "Often (4)", sub: "Constant distraction", value: 4 },
    ],
  },
];

export default function QuickQuizModal({ isOpen, onClose, onComplete }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});

  if (!isOpen) return null;

  const currentStep = STEPS[stepIdx];
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const handleSelect = (val) => {
    const next = { ...answers, [currentStep.key]: val };
    setAnswers(next);
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      onComplete(next);
      setStepIdx(0);
      setAnswers({});
    }
  };

  return (
    <div className="quiz-backdrop" role="dialog" aria-modal="true" aria-labelledby="quiz-heading">
      <div className="quiz-card">
        <div className="quiz-top">
          <span className="quiz-step-text">
            Question {stepIdx + 1} of {STEPS.length}
          </span>
          <button
            type="button"
            className="quiz-close"
            onClick={() => {
              setStepIdx(0);
              onClose();
            }}
          >
            Close
          </button>
        </div>

        <div className="quiz-progress-track">
          <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <h2 id="quiz-heading" className="quiz-question">
          {currentStep.question}
        </h2>

        <div className="quiz-options">
          {currentStep.options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              className="quiz-option-btn"
              onClick={() => handleSelect(opt.value)}
            >
              <strong>{opt.label}</strong>
              <span>{opt.sub}</span>
            </button>
          ))}
        </div>

        {stepIdx > 0 && (
          <button type="button" className="quiz-back-btn" onClick={() => setStepIdx(stepIdx - 1)}>
            Back
          </button>
        )}
      </div>
    </div>
  );
}
