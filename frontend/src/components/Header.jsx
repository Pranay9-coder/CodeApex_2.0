import { Globe, Sparkles } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
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
        <label className="selector-wrap">
          <Globe size={14} />
          <select value={language} onChange={(e) => onLanguageChange(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label className="selector-wrap">
          <span>Voice</span>
          <select value={voiceMode} onChange={(e) => onVoiceModeChange(e.target.value)}>
            <option value="stable">Stable</option>
            <option value="dynamic">Dynamic</option>
          </select>
        </label>
      </div>
    </header>
  );
}
