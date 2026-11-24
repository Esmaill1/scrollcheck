import { EASTER_EGGS } from "./easterEggs.js";

export default function EasterEggOverlay({
  toast,
  vaultOpen,
  unlockedEggs = [],
  nokiaMode = false,
  onOpenVault,
  onCloseVault,
  onDismissToast,
  onToggleNokia,
}) {
  const unlockedSet = new Set(unlockedEggs);
  const unlockedCount = unlockedSet.size;
  const totalCount = EASTER_EGGS.length;
  const nokiaUnlocked = unlockedSet.has("nokia_mode");

  return (
    <>
      {toast && (
        <div className="egg-toast" role="status" aria-live="polite">
          <div className="egg-toast-head">
            <span className="egg-toast-badge">
              {unlockedCount >= totalCount
                ? `جمّعت كل الأسرار · ${unlockedCount} / ${totalCount}`
                : `سر مفتوح · ${unlockedCount} / ${totalCount}`}
            </span>
            <button
              type="button"
              className="egg-toast-close"
              onClick={onDismissToast}
              aria-label="إغلاق الإشعار"
            >
              ×
            </button>
          </div>
          <p className="egg-toast-msg">{toast.message}</p>
          <div className="egg-toast-actions">
            <button type="button" className="egg-toast-link" onClick={onOpenVault}>
              شوف الأسرار
            </button>
          </div>
        </div>
      )}

      {vaultOpen && (
        <div
          className="egg-vault-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseVault?.();
          }}
        >
          <div
            className="egg-vault-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="egg-vault-title"
          >
            <div className="egg-vault-header">
              <div>
                <h2 id="egg-vault-title" className="egg-vault-title">
                  أسرار ScrollCheck
                </h2>
                <span className="egg-vault-count">
                  {unlockedCount} / {totalCount} مفتوحين
                </span>
              </div>
              <button
                type="button"
                className="btn-ghost-sm"
                onClick={onCloseVault}
              >
                إغلاق
              </button>
            </div>

            <div className="egg-trivia-box">
              معلومة من الداتا: أكتر طالب مسحول في الـ 705 بيقعد 8.5 ساعة على TikTok وبينام 3.8 ساعة بس
            </div>

            <ul className="egg-vault-list">
              {EASTER_EGGS.map((egg) => {
                const isUnlocked = unlockedSet.has(egg.id);
                return (
                  <li
                    key={egg.id}
                    className={`egg-vault-row ${isUnlocked ? "is-unlocked" : "is-locked"}`}
                  >
                    <span className="egg-vault-icon" aria-hidden="true">
                      {isUnlocked ? (
                        <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                          <circle cx="8" cy="8" r="7.5" fill="#10B981" />
                          <path
                            d="M4.6 8.2 L6.9 10.5 L11.4 5.6"
                            stroke="#FFFFFF"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                          <rect
                            x="3"
                            y="7"
                            width="10"
                            height="7"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </span>
                    <div className="egg-vault-text">
                      <strong>{egg.title}</strong>
                      <span>{isUnlocked ? "مفتوح" : `التلميح: ${egg.hint}`}</span>
                    </div>
                  </li>
                );
              })}
            </ul>

            {nokiaUnlocked && (
              <div className="egg-vault-footer">
                <button
                  type="button"
                  className="btn-ghost-sm"
                  onClick={onToggleNokia}
                >
                  {nokiaMode ? "اقفل وضع نوكيا 3310" : "شغّل وضع نوكيا 3310"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
