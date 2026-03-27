import { Languages, Sparkles } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
];

export default function Header({ language, onLanguageChange, voiceMode, onVoiceModeChange }) {
  return (
    <header className="topbar glass-card-subtle">
      <div className="brand-wrap">
        <div className="brand-icon">
          <Sparkles size={16} />
        </div>
        <div>
          <h1>AI Bank Assistant</h1>
          <p>Voice Kiosk Interface</p>
        </div>
      </div>

      <div className="header-controls">
        <div className="control-group">
          <span className="control-label">
            <Languages size={14} />
            Language / भाषा / भाषा
          </span>
          <div className="lang-toggle" role="tablist" aria-label="Language selector">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`lang-btn ${language === l.code ? "active" : ""}`}
                onClick={() => onLanguageChange(l.code)}
                aria-pressed={language === l.code}
                title={l.label}
              >
                {l.native}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <span className="control-label">Voice Style</span>
          <div className="mode-toggle" role="tablist" aria-label="Voice style selector">
            <button
              type="button"
              className={`mode-btn ${voiceMode === "stable" ? "active" : ""}`}
              onClick={() => onVoiceModeChange("stable")}
              aria-pressed={voiceMode === "stable"}
            >
              Stable
            </button>
            <button
              type="button"
              className={`mode-btn ${voiceMode === "dynamic" ? "active" : ""}`}
              onClick={() => onVoiceModeChange("dynamic")}
              aria-pressed={voiceMode === "dynamic"}
            >
              Dynamic
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
