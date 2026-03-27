import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, LogOut, Mic, Send } from "lucide-react";
import { motion } from "framer-motion";
import Header from "./components/Header";
import VoiceOrb from "./components/VoiceOrb";
import SuggestionChips from "./components/SuggestionChips";
import { getTtsAudio, loginByMobile, logoutUser, processText } from "./services/api";

const HEADING = {
  en: "How can I help you today?",
  hi: "मैं आज आपकी कैसे मदद कर सकता हूँ?",
  mr: "मी आज तुम्हाला कशी मदत करू शकतो?",
};

const SUB = {
  en: "Speak naturally — English, Hindi and Marathi are supported",
  hi: "स्वाभाविक रूप से बोलें — अंग्रेजी, हिंदी और मराठी समर्थित हैं",
  mr: "नैसर्गिकपणे बोला — इंग्रजी, हिंदी आणि मराठी समर्थित आहेत",
};

export default function App() {
  const [language, setLanguage] = useState("en");
  const [voiceMode, setVoiceMode] = useState("stable");
  const [assistantState, setAssistantState] = useState("idle");
  const [loginPhone, setLoginPhone] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const recognitionSupported = useMemo(
    () => typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window),
    []
  );

  const welcomeText = useMemo(() => HEADING[language] || HEADING.en, [language]);
  const subText = useMemo(() => SUB[language] || SUB.en, [language]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const playTts = async (text, lang) => {
    try {
      const blob = await getTtsAudio(text, lang, voiceMode);
      const url = URL.createObjectURL(blob);
      stopAudio();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setAssistantState("idle");
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setAssistantState("idle");
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch {
      setAssistantState("idle");
    }
  };

  const addMessage = (role, content, lang) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role,
        content,
        language: lang,
      },
    ]);
  };

  useEffect(() => {
    if (!recognitionSupported) {
      return;
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setAssistantState("listening");
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
      if (!transcript) {
        setAssistantState("idle");
        return;
      }

      setInputText(transcript);
      ask(transcript);
    };

    recognition.onerror = () => {
      setAssistantState("idle");
      addMessage(
        "assistant",
        language === "hi"
          ? "माइक से आवाज़ नहीं मिली। कृपया फिर कोशिश करें।"
          : language === "mr"
          ? "माइकवर आवाज मिळाली नाही. कृपया पुन्हा प्रयत्न करा."
          : "Mic did not capture voice. Please try again.",
        language
      );
    };

    recognition.onend = () => {
      setAssistantState((current) => (current === "listening" ? "idle" : current));
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Ignore cleanup errors.
      }
      recognitionRef.current = null;
    };
  }, [recognitionSupported, language]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (loginPhone.length !== 10) {
      setLoginError("Enter a valid 10-digit mobile number");
      return;
    }

    setIsLoggingIn(true);
    try {
      const result = await loginByMobile(loginPhone);
      setIsLoggedIn(true);
      addMessage("assistant", `Welcome ${result.user?.name || "User"}. Ask your banking question.`, language);
    } catch (err) {
      setLoginError(err.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const ask = useCallback(async (text) => {
    if (!text.trim()) return;
    stopAudio();
    addMessage("user", text.trim(), language);
    setInputText("");
    setAssistantState("processing");

    try {
      const result = await processText(text.trim(), language);
      const reply = result.response_text || "Please try again.";
      const lang = result.language || language;
      addMessage("assistant", reply, lang);
      setAssistantState("speaking");
      await playTts(reply, lang);
    } catch (err) {
      addMessage("assistant", err.message || "Server error", language);
      setAssistantState("idle");
    }
  }, [language, voiceMode]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // noop
    }
    stopAudio();
    setIsLoggedIn(false);
    setMessages([]);
    setInputText("");
    setAssistantState("idle");
  };

  return (
    <div className="kiosk-root">
      <div className="bg-fx" />
      <Header
        language={language}
        onLanguageChange={setLanguage}
        voiceMode={voiceMode}
        onVoiceModeChange={setVoiceMode}
      />

      {!isLoggedIn && (
        <div className="login-overlay">
          <form className="login-card glass-card" onSubmit={handleLogin}>
            <h2>Secure Login</h2>
            <p>Use registered mobile number. Demo: 9000006439</p>
            <input
              value={loginPhone}
              onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Enter 10-digit mobile"
            />
            {loginError ? <span className="err">{loginError}</span> : null}
            <button type="submit" disabled={isLoggingIn || loginPhone.length < 10}>
              {isLoggingIn ? <Loader2 className="spin" size={16} /> : "Verify & Continue"}
            </button>
          </form>
        </div>
      )}

      <main className={`main-area ${!isLoggedIn ? "dim" : ""}`}>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {welcomeText}
        </motion.h2>
        <p className="sub">{subText}</p>

        <VoiceOrb
          state={assistantState}
          onClick={() => {
            if (!isLoggedIn) {
              return;
            }
            if (assistantState === "speaking") {
              stopAudio();
              setAssistantState("idle");
              return;
            }

            if (!recognitionSupported || !recognitionRef.current) {
              addMessage(
                "assistant",
                language === "hi"
                  ? "आपके ब्राउज़र में voice input supported नहीं है।"
                  : language === "mr"
                  ? "तुमच्या ब्राउझरमध्ये voice input supported नाही."
                  : "Voice input is not supported in this browser.",
                language
              );
              return;
            }

            if (assistantState === "listening") {
              recognitionRef.current.stop();
              return;
            }

            recognitionRef.current.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
            try {
              recognitionRef.current.start();
            } catch {
              setAssistantState("idle");
            }
          }}
        />

        <div className="status-line">
          <span className={`dot ${assistantState}`} />
          <span>{assistantState === "idle" ? "Ready" : assistantState}</span>
          {isLoggedIn ? (
            <button className="logout" onClick={handleLogout}>
              <LogOut size={14} />
              Logout
            </button>
          ) : null}
        </div>

        <SuggestionChips language={language} onPick={ask} />

        <div className="chat-panel glass-card">
          <div className="chat-list">
            {messages.map((m) => (
              <div key={m.id} className={`bubble ${m.role}`}>
                {m.content}
              </div>
            ))}
          </div>
          <div className="chat-input-wrap">
            <button className="icon-btn" type="button" title="Mic placeholder">
              <Mic size={16} />
            </button>
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === "hi" ? "अपना प्रश्न लिखें" : language === "mr" ? "तुमचा प्रश्न लिहा" : "Type your question"}
              onKeyDown={(e) => {
                if (e.key === "Enter") ask(inputText);
              }}
            />
            <button className="icon-btn send" type="button" onClick={() => ask(inputText)}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
