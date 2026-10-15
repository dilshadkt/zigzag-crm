import { useState, useRef, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";
import { browserLanguage, detectLanguage } from "../utils/detectLanguage";

const SpeechRecognitionImpl =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

// Replies are read aloud, so strip markdown / reasoning tags first.
const toSpeakableText = (text = "") =>
  text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```[\s\S]*?```/g, " code block ")
    .replace(/[*_`#>~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const MAX_HISTORY = 10;

const normLang = (lang = "") => lang.replace("_", "-").toLowerCase();

// Voices load asynchronously in some browsers; getVoices() may be empty at first.
const findVoice = (language) => {
  if (!canSpeak) return null;
  const voices = window.speechSynthesis.getVoices();
  const target = normLang(language);
  const base = target.split("-")[0];
  return (
    voices.find((v) => normLang(v.lang) === target) ||
    voices.find((v) => normLang(v.lang).split("-")[0] === base) ||
    null
  );
};

// Auto mode listens in the language you used last, remembered across visits
const LAST_LANGUAGE_KEY = "aiAssistantLastLang";
const loadLastLanguage = () => {
  try {
    const saved = localStorage.getItem(LAST_LANGUAGE_KEY);
    if (saved === "ml-IN" || saved === "en-IN") return saved;
  } catch {
    /* ignore */
  }
  return browserLanguage();
};
const saveLastLanguage = (lang) => {
  try {
    localStorage.setItem(LAST_LANGUAGE_KEY, lang);
  } catch {
    /* ignore */
  }
};

const makeError = (code, message = "") => ({ code, message });

// Spoken or typed answers to "shall I go ahead?" (same word lists as the server)
const YES_WORDS = new Set(["yes","yeah","yep","yup","sure","ok","okay","confirm","confirmed","proceed","correct","absolutely","definitely","right","അതെ","ശരി","ഓക്കെ","ഓകെ","ഒക്കെ","ചെയ്യൂ","ചെയ്തോളൂ","ചെയ്തോ","ചെയ്യ്","ചെയ്യു","കൺഫേം","കൺഫേമ്","ആകട്ടെ","മതി","ഉവ്വ്"]);
const NO_WORDS = new Set(["no","nope","nah","cancel","stop","don't","dont","never","വേണ്ട","വേണ്ടാ","ഇല്ല","നിർത്ത്","നിർത്തൂ","ക്യാൻസൽ","കാൻസൽ"]);
const FILLER_WORDS = new Set(["please","it","that","this","the","meeting","now","thanks","thank","you","and","then","just","mind","forget","leave","schedule","book","send","invite","invites","go","ahead","do","is","thats","that's","ഒന്ന്","ഇപ്പോൾ","ദയവായി","പ്ലീസ്","മീറ്റിംഗ്","ആണ്"]);

/**
 * Is this a plain "yes" or "no" to "shall I go ahead?" ... and nothing more?
 * "ok make it 6" and "yes but add Priya" are changes, not answers, so they return null.
 * "No" wins if both appear.
 */
const plainAnswer = (text = "") => {
  const lower = String(text).toLowerCase();
  const tokens = lower.split(/[\s.,!?;:"()]+/).filter(Boolean);
  if (!tokens.length || tokens.length > 8) return null;
  const known = (t) => YES_WORDS.has(t) || NO_WORDS.has(t) || FILLER_WORDS.has(t);
  if (!tokens.every(known)) return null;
  if (tokens.some((t) => NO_WORDS.has(t))) return "no";
  if (tokens.some((t) => YES_WORDS.has(t)) || lower.includes("go ahead") || lower.includes("do it")) {
    return "yes";
  }
  return null;
};

/**
 * Voice assistant state machine: idle -> listening -> thinking -> speaking -> idle.
 * STT/TTS use the browser's speech APIs (free, with a server voice fallback);
 * the LLM goes through POST /ai/chat.
 *
 * `language` is "auto" | "en-IN" | "ml-IN". Browsers can't detect the spoken
 * language, so in auto mode the mic listens in the language of the user's last
 * message (typed or spoken) and replies are spoken in the language they're written in.
 *
 * `error` is { code, message } | null. Codes: mic-blocked, no-mic, no-speech,
 * stt-network, busy, rate-limited, network, failed, tts-failed, action-failed.
 *
 * Actions (clock in, leave request...) are never run by the assistant itself: the server
 * returns a `pendingAction` and nothing happens until the user confirms it here (button,
 * or a spoken/typed "yes"), which calls the confirm endpoint.
 */
export const useVoiceAssistant = ({
  model,
  language = "auto",
  onActions,
  ttsVoice,
} = {}) => {
  const [status, setStatus] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const [voiceReplies, setVoiceReplies] = useState(true);
  const [lastReply, setLastReply] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState(loadLastLanguage);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionResult, setActionResult] = useState(null);
  const queryClient = useQueryClient();

  const recognitionRef = useRef(null);
  const messagesRef = useRef([]);
  const requestIdRef = useRef(0);
  const voiceRepliesRef = useRef(voiceReplies);
  const finalTranscriptRef = useRef("");
  const lastUserTextRef = useRef("");
  const onActionsRef = useRef(onActions);
  onActionsRef.current = onActions;
  const ttsVoiceRef = useRef(ttsVoice);
  ttsVoiceRef.current = ttsVoice;
  const languageRef = useRef(language);
  const detectedLanguageRef = useRef(detectedLanguage);
  const audioRef = useRef(null);
  const speakIdRef = useRef(0);
  const pendingRef = useRef(null);
  const requestInFlightRef = useRef(0); // id of the model request being worked on, 0 when none
  const lastLangRef = useRef(detectedLanguage);
  const armListenRef = useRef(false);
  const confirmRef = useRef(null);
  const cancelRef = useRef(null);

  pendingRef.current = pendingAction;
  languageRef.current = language;
  detectedLanguageRef.current = detectedLanguage;
  voiceRepliesRef.current = voiceReplies;
  messagesRef.current = messages;

  const sttSupported = Boolean(SpeechRecognitionImpl);
  const activeLanguage = language === "auto" ? detectedLanguage : language;

  const listenLanguage = () =>
    languageRef.current === "auto"
      ? detectedLanguageRef.current
      : languageRef.current;

  const stopSpeaking = useCallback(() => {
    speakIdRef.current++;
    if (canSpeak) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setStatus((s) => (s === "speaking" ? "idle" : s));
  }, []);

  // Fallback for languages the browser has no voice for: server-generated audio.
  const speakWithServer = useCallback(async (text, lang, voiceOverride) => {
    const speakId = ++speakIdRef.current;
    try {
      setStatus("speaking");
      const { data } = await apiClient.post(
        "/ai/tts",
        { text, language: lang, voice: voiceOverride || ttsVoiceRef.current },
        { responseType: "blob" },
      );
      if (speakId !== speakIdRef.current) return;
      const url = URL.createObjectURL(data);
      const audio = new Audio(url);
      audioRef.current = audio;
      const done = () => {
        URL.revokeObjectURL(url);
        if (audioRef.current === audio) audioRef.current = null;
        if (speakId === speakIdRef.current) setStatus("idle");
      };
      audio.onended = done;
      audio.onerror = done;
      await audio.play();
    } catch {
      if (speakId !== speakIdRef.current) return;
      setError(makeError("tts-failed"));
      setStatus("idle");
    }
  }, []);

  const speak = useCallback(
    (text, lang) => {
      speakIdRef.current++;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const speakable = toSpeakableText(text);
      if (!speakable) {
        setStatus("idle");
        return;
      }
      // Replies containing Malayalam are voiced by the server: they usually mix in English
      // names and titles ("ASIANIC DIGITAL STORE"), which a browser Malayalam voice reads
      // wrongly. The server reads each part with a voice that speaks that script.
      const hasMalayalam = /[ഀ-ൿ]/.test(speakable);
      const voice = findVoice(lang);
      // Without a browser voice for this language it would be read badly (or not at all)
      if (hasMalayalam || (!voice && !lang.startsWith("en")) || !canSpeak) {
        speakWithServer(speakable, hasMalayalam ? "ml-IN" : lang);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speakable);
      utterance.lang = lang;
      if (voice) utterance.voice = voice;
      utterance.rate = 1;
      utterance.onstart = () => setStatus("speaking");
      utterance.onend = () => setStatus("idle");
      utterance.onerror = () => setStatus("idle");
      window.speechSynthesis.speak(utterance);
    },
    [speakWithServer],
  );

  const sendMessage = useCallback(
    async (text, { viaVoice = false } = {}) => {
      const content = (text || "").trim();
      if (!content) return;

      // A "yes"/"no" while an action is waiting answers it directly (no model call)
      if (pendingRef.current) {
        const answer = plainAnswer(content);
        const lang = detectLanguage(content);
        if (lang) lastLangRef.current = lang;
        if (answer === "yes") {
          // A change request is still being worked out: the card on screen is about to be
          // replaced, so a "yes" now must not run the old one. Ask again once it appears.
          if (requestInFlightRef.current) return;
          confirmRef.current?.();
          return;
        }
        if (answer === "no") {
          cancelRef.current?.();
          return;
        }
      }

      stopSpeaking();
      setActionResult(null);
      setError(null);
      setTranscript("");
      setLastReply("");
      lastUserTextRef.current = content;

      // Auto mode: remember the language so the mic listens in it next time
      const detected = detectLanguage(content);
      if (detected) {
        setDetectedLanguage(detected);
        saveLastLanguage(detected);
        lastLangRef.current = detected;
      }

      const requestId = ++requestIdRef.current;
      const history = messagesRef.current.slice(-MAX_HISTORY);
      const userMessage = { role: "user", content };
      setMessages((prev) => [...prev, userMessage]);
      setStatus("thinking");
      requestInFlightRef.current = requestId;

      try {
        // The server builds the system prompt, runs data tools as this user, and
        // may return UI actions (e.g. open a page).
        const { data } = await apiClient.post("/ai/agent", {
          messages: [...history, userMessage],
          language: languageRef.current,
          ...(model ? { model } : {}),
        });

        // Ignore stale responses (user cleared chat or sent something newer)
        if (requestId !== requestIdRef.current) return;

        if (!data?.success) throw new Error(data?.message || "AI request failed");

        const reply = (data.data?.response || "")
          .replace(/<think>[\s\S]*?<\/think>/gi, "")
          .trim();
        if (!reply) throw new Error("The assistant returned an empty reply.");

        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        setLastReply(reply);
        const actions = data.data?.actions || [];
        if (actions.length) onActionsRef.current?.(actions);
        const proposed = data.data?.pendingAction;
        // The card always mirrors the server: a new one replaces the old, none means the old
        // one is no longer waiting (the server drops it when the conversation moves on).
        setPendingAction(proposed || null);
        // The action already ran (the user said "...and confirm it" in the same command)
        const ran = data.data?.actionResult;
        if (ran) {
          setActionResult(ran);
          if (ran.ok) queryClient.invalidateQueries();
          else setError(makeError("action-failed", ran.message));
        }
        // The assistant asked a question and the user is talking to it: open the mic for the
        // answer once it has finished speaking, so a whole request is one conversation.
        armListenRef.current = viaVoice && Boolean(data.data?.expectsReply);
        if (voiceRepliesRef.current) {
          speak(reply, detectLanguage(reply) || listenLanguage());
        } else {
          setStatus("idle");
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        // Drop the unanswered message so a retry doesn't duplicate it in the history
        setMessages((prev) =>
          prev[prev.length - 1] === userMessage ? prev.slice(0, -1) : prev,
        );
        const httpStatus = err?.response?.status;
        const serverCode = err?.response?.data?.code;
        if (serverCode === "rate_limited" || serverCode === "daily_limit") {
          setError(makeError("rate-limited", err.response.data.message));
        } else if (httpStatus === 429) {
          setError(makeError("busy"));
        } else if (!err?.response) {
          setError(makeError("network"));
        } else {
          setError(
            makeError("failed", err.response?.data?.message || err.message),
          );
        }
        setStatus("idle");
      } finally {
        if (requestInFlightRef.current === requestId) requestInFlightRef.current = 0;
      }
    },
    [model, queryClient, speak, stopSpeaking],
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  // `auto` = the assistant just asked something and reopened the mic itself
  const startListening = useCallback((options = {}) => {
    const auto = options.auto === true;
    if (!SpeechRecognitionImpl) {
      setError(makeError("unsupported"));
      return;
    }

    stopSpeaking();
    setError(null);
    finalTranscriptRef.current = "";
    setTranscript("");

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = listenLanguage();
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setStatus("listening");
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscriptRef.current + interim);
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError(makeError("mic-blocked"));
      } else if (event.error === "audio-capture") {
        setError(makeError("no-mic"));
      } else if (event.error === "no-speech") {
        // If the mic reopened by itself and nobody answered, just stop quietly
        if (!auto) setError(makeError("no-speech"));
      } else if (event.error === "network") {
        setError(makeError("stt-network"));
      } else if (event.error !== "aborted") {
        setError(makeError("failed", `Voice input error: ${event.error}`));
      }
      setStatus("idle");
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      const finalText = finalTranscriptRef.current.trim();
      if (finalText) {
        sendMessage(finalText, { viaVoice: true });
      } else {
        setTranscript("");
        setStatus((s) => (s === "listening" ? "idle" : s));
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setStatus("idle");
    }
  }, [sendMessage, stopSpeaking]);

  const toggleListening = useCallback(() => {
    if (status === "listening") stopListening();
    else startListening();
  }, [startListening, status, stopListening]);

  const finishAction = useCallback(
    (message, ok) => {
      setActionResult({ ok, message });
      setLastReply(message);
      if (ok) queryClient.invalidateQueries(); // tasks, attendance, leave... may have changed
      else setError(makeError("action-failed", message));
      if (voiceRepliesRef.current && message) {
        speak(message, detectLanguage(message) || lastLangRef.current);
      } else {
        setStatus("idle");
      }
    },
    [queryClient, speak],
  );

  const confirmPending = useCallback(async () => {
    const pending = pendingRef.current;
    if (!pending) return;
    stopSpeaking();
    armListenRef.current = false;
    setPendingAction(null);
    setError(null);
    setStatus("thinking");
    try {
      const { data } = await apiClient.post(`/ai/actions/${pending.id}/confirm`, {
        language: lastLangRef.current,
      });
      finishAction(data.message, true);
    } catch (err) {
      finishAction(
        err?.response?.data?.message || "That didn't go through, so nothing was changed.",
        false,
      );
    }
  }, [finishAction, stopSpeaking]);

  const cancelPending = useCallback(async () => {
    const pending = pendingRef.current;
    if (!pending) return;
    stopSpeaking();
    armListenRef.current = false;
    setPendingAction(null);
    try {
      const { data } = await apiClient.post(`/ai/actions/${pending.id}/cancel`, {
        language: lastLangRef.current,
      });
      setLastReply(data.message || "");
      if (voiceRepliesRef.current && data.message) {
        speak(data.message, detectLanguage(data.message) || lastLangRef.current);
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  }, [speak, stopSpeaking]);

  confirmRef.current = confirmPending;
  cancelRef.current = cancelPending;

  // The "done" banner fades away on its own
  useEffect(() => {
    if (!actionResult) return undefined;
    const t = setTimeout(() => setActionResult(null), 7000);
    return () => clearTimeout(t);
  }, [actionResult]);

  // The pending action expires on the server; drop it here at the same time
  useEffect(() => {
    if (!pendingAction?.expiresAt) return undefined;
    const ms = new Date(pendingAction.expiresAt).getTime() - Date.now();
    const t = setTimeout(() => setPendingAction(null), Math.max(ms, 0));
    return () => clearTimeout(t);
  }, [pendingAction]);

  // After the assistant asks "shall I?" out loud, listen for the spoken answer once
  useEffect(() => {
    if (status === "idle" && armListenRef.current && SpeechRecognitionImpl) {
      armListenRef.current = false;
      startListening({ auto: true });
    }
  }, [status, startListening]);

  /** Re-send the last message after an AI/network error. */
  const retry = useCallback(() => {
    if (lastUserTextRef.current) sendMessage(lastUserTextRef.current);
  }, [sendMessage]);

  const dismissError = useCallback(() => setError(null), []);

  const clearChat = useCallback(() => {
    requestIdRef.current++;
    recognitionRef.current?.abort();
    stopSpeaking();
    lastUserTextRef.current = "";
    setMessages([]);
    setTranscript("");
    setLastReply("");
    setError(null);
    setPendingAction(null);
    setActionResult(null);
    armListenRef.current = false;
    setStatus("idle");
  }, [stopSpeaking]);

  /** Say a short sample sentence in the given server voice (used by the voice picker). */
  const previewVoice = useCallback(
    (voice) => {
      stopSpeaking();
      speakWithServer(
        "ഇന്ന് പെൻഡിങ് ടാസ്ക് ഒന്നും ഇല്ല കേട്ടോ. പക്ഷേ ഒരു മീറ്റിംഗ് ഉണ്ട്.",
        "ml-IN",
        voice,
      );
    },
    [speakWithServer, stopSpeaking],
  );

  const toggleVoiceReplies = useCallback(() => {
    setVoiceReplies((prev) => {
      if (prev) stopSpeaking();
      return !prev;
    });
  }, [stopSpeaking]);

  // Stop mic/speech when leaving the dashboard
  useEffect(
    () => () => {
      recognitionRef.current?.abort();
      speakIdRef.current++;
      if (canSpeak) window.speechSynthesis.cancel();
      audioRef.current?.pause();
    },
    [],
  );

  return {
    status,
    messages,
    transcript,
    error,
    lastReply,
    pendingAction,
    actionResult,
    confirmPending,
    cancelPending,
    activeLanguage,
    voiceReplies,
    sttSupported,
    sendMessage,
    toggleListening,
    stopSpeaking,
    retry,
    dismissError,
    clearChat,
    toggleVoiceReplies,
    previewVoice,
  };
};
