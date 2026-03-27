const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const authPanel = document.getElementById("authPanel");
const chatPanel = document.getElementById("chatPanel");
const profileLine = document.getElementById("profileLine");
const logoutBtn = document.getElementById("logoutBtn");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");
const languageSelect = document.getElementById("languageSelect");
const micBtn = document.getElementById("micBtn");
const voiceCore = document.getElementById("voiceCore");
const speakToggle = document.getElementById("speakToggle");
const voiceState = document.getElementById("voiceState");
const quickPrompts = document.getElementById("quickPrompts");
const voiceModeSelect = document.getElementById("voiceModeSelect");

let speechEnabled = true;
let recognition = null;
let micActive = false;
let currentAudio = null;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    micActive = true;
    micBtn.textContent = "Listening";
    voiceCore.classList.add("listening");
    voiceState.textContent = "Listening...";
  };

  recognition.onend = () => {
    micActive = false;
    micBtn.textContent = "Mic";
    voiceCore.classList.remove("listening");
    voiceState.textContent = "Voice idle";
  };

  recognition.onerror = () => {
    micActive = false;
    micBtn.textContent = "Mic";
    voiceCore.classList.remove("listening");
    voiceState.textContent = "Mic error. Try again.";
  };

  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript || "";
    if (transcript.trim()) {
      messageInput.value = transcript.trim();
      chatForm.requestSubmit();
    }
  };
} else {
  micBtn.disabled = true;
  micBtn.title = "Speech recognition not supported in this browser";
}

function setStatus(msg, isError = false) {
  loginStatus.textContent = msg;
  loginStatus.classList.toggle("error", isError);
}

function addMessage(content, who = "bot") {
  const el = document.createElement("div");
  el.className = `msg ${who}`;
  el.textContent = content;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function setBusyState(isBusy) {
  messageInput.disabled = isBusy;
  const submitBtn = chatForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = isBusy;
    submitBtn.textContent = isBusy ? "Thinking..." : "Send";
  }
}

function detectAnswerLang(text) {
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (!hasDevanagari) {
    return "en-IN";
  }

  const hiHints = ["आप", "है", "कैसे", "कितना", "मेरा", "उत्तर"];
  const mrHints = ["तुमचे", "आहे", "कसे", "माझ", "शिल्लक", "व्यवहार"];
  const lower = text.toLowerCase();

  let hiScore = 0;
  let mrScore = 0;
  hiHints.forEach((h) => {
    if (lower.includes(h)) hiScore += 1;
  });
  mrHints.forEach((h) => {
    if (lower.includes(h)) mrScore += 1;
  });

  return mrScore > hiScore ? "mr-IN" : "hi-IN";
}

function browserSpeakFallback(text, lang) {
  if (!speechEnabled || !window.speechSynthesis || !text) {
    return;
  }

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  if (lang === "hi") utter.lang = "hi-IN";
  else if (lang === "mr") utter.lang = "mr-IN";
  else utter.lang = detectAnswerLang(text);
  utter.rate = 0.95;

  utter.onstart = () => {
    voiceCore.classList.add("speaking");
    voiceState.textContent = "Speaking...";
  };
  utter.onend = () => {
    voiceCore.classList.remove("speaking");
    voiceState.textContent = "Voice idle";
  };
  utter.onerror = () => {
    voiceCore.classList.remove("speaking");
    voiceState.textContent = "Voice idle";
  };

  window.speechSynthesis.speak(utter);
}

async function speakText(text, lang) {
  if (!speechEnabled || !text) {
    return;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  try {
    voiceCore.classList.add("speaking");
    voiceState.textContent = "Speaking...";
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        language: lang || "en",
        voice_mode: voiceModeSelect?.value || "stable",
      }),
    });

    if (!res.ok) {
      throw new Error("Server TTS failed");
    }

    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    currentAudio = new Audio(audioUrl);
    currentAudio.onended = () => {
      voiceCore.classList.remove("speaking");
      voiceState.textContent = "Voice idle";
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
    };
    currentAudio.onerror = () => {
      voiceCore.classList.remove("speaking");
      voiceState.textContent = "Voice idle";
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      browserSpeakFallback(text, lang);
    };

    await currentAudio.play();
  } catch (_err) {
    voiceCore.classList.remove("speaking");
    voiceState.textContent = "Voice idle";
    browserSpeakFallback(text, lang);
  }
}

async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Checking mobile number...");
  const mobile = document.getElementById("mobile").value.trim();

  try {
    const data = await postJSON("/api/login", { mobile });
    authPanel.classList.add("hidden");
    chatPanel.classList.remove("hidden");
    profileLine.textContent = `${data.user.name} | ${data.user.district} | ${data.user.user_type}`;
    addMessage("Welcome! Ask your banking question in English, Hindi or Marathi.", "bot");
    addMessage("Tip: Use Reply Language and Voice Mode controls above chat.", "bot");
    setStatus("");
    messageInput.focus();
  } catch (err) {
    setStatus(err.message, true);
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await postJSON("/api/logout", {});
  } catch (_err) {
    // Ignore logout network errors and reset UI locally.
  }

  chatBox.innerHTML = "";
  authPanel.classList.remove("hidden");
  chatPanel.classList.add("hidden");
  setStatus("Signed out.");
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message) {
    return;
  }

  addMessage(message, "user");
  messageInput.value = "";
  setBusyState(true);

  try {
    const data = await postJSON("/api/chat", {
      message,
      language: languageSelect.value,
    });

    addMessage(data.answer, "bot");
    speakText(data.answer, data.language);
  } catch (err) {
    addMessage(err.message || "Could not process your request.", "bot");
  } finally {
    setBusyState(false);
    messageInput.focus();
  }
});

micBtn.addEventListener("click", () => {
  if (!recognition) {
    return;
  }

  if (micActive) {
    recognition.stop();
    return;
  }

  const selectedLang = languageSelect.value;
  if (selectedLang === "hi") recognition.lang = "hi-IN";
  else if (selectedLang === "mr") recognition.lang = "mr-IN";
  else recognition.lang = "en-IN";

  recognition.start();
});

speakToggle.addEventListener("click", () => {
  speechEnabled = !speechEnabled;
  speakToggle.textContent = speechEnabled ? "Speech On" : "Speech Off";
  speakToggle.classList.toggle("off", !speechEnabled);
  if (!speechEnabled && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (!speechEnabled && currentAudio) {
    currentAudio.pause();
    currentAudio = null;
    voiceCore.classList.remove("speaking");
    voiceState.textContent = "Voice idle";
  }
});

if (quickPrompts) {
  quickPrompts.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (!target.classList.contains("chip")) {
      return;
    }

    const prompt = target.getAttribute("data-prompt");
    if (!prompt) {
      return;
    }

    messageInput.value = prompt;
    messageInput.focus();
  });
}

if (voiceModeSelect) {
  voiceModeSelect.addEventListener("change", () => {
    const label = voiceModeSelect.value === "dynamic" ? "Dynamic voice enabled" : "Stable voice enabled";
    voiceState.textContent = label;
    setTimeout(() => {
      if (!micActive) {
        voiceState.textContent = "Voice idle";
      }
    }, 1400);
  });
}
