import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  motionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FiAlertTriangle,
  FiArrowUp,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiGlobe,
  FiMic,
  FiMicOff,
  FiMoreVertical,
  FiRefreshCw,
  FiSquare,
  FiVolumeX,
  FiWifiOff,
  FiX,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../api/client";
import { useAuth } from "../../../hooks/useAuth";
import { useVoiceAssistant } from "../../../hooks/useVoiceAssistant";

const MODELS = [
  { label: "Default", value: "" },
  { label: "Gemma 4 31B (free)", value: "google/gemma-4-31b-it:free" },
  { label: "Nemotron 3 Super 120B (free)", value: "nvidia/nemotron-3-super-120b-a12b:free" },
  { label: "Laguna S 2.1 (free)", value: "poolside/laguna-s-2.1:free" },
];

const VOICES = [
  { value: "malayalam", label: "Malayalam · female" },
  { value: "malayalam-male", label: "Malayalam · male" },
  { value: "multilingual", label: "Natural multilingual · female" },
  { value: "multilingual-male", label: "Natural multilingual · male" },
];

const LANGUAGES = [
  { value: "auto", label: "Auto-detect", short: "Auto" },
  { value: "en-IN", label: "English", short: "EN" },
  { value: "ml-IN", label: "മലയാളം (Malayalam)", short: "ML" },
];

const SUGGESTIONS = {
  "en-IN": [
    "What's on my plate today?",
    "Anything overdue?",
    "Any meetings coming up?",
    "How many leads this week?",
    "Open my tasks",
  ],
  "ml-IN": [
    "ഇന്ന് എനിക്ക് എന്തൊക്കെ ടാസ്കുകൾ ഉണ്ട്?",
    "ഡെഡ്‌ലൈൻ കഴിഞ്ഞ ടാസ്കുകൾ ഉണ്ടോ?",
    "വരാനിരിക്കുന്ന മീറ്റിംഗുകൾ ഏതൊക്കെയാണ്?",
    "ഈ ആഴ്ച എത്ര ലീഡുകൾ കിട്ടി?",
    "എന്റെ ടാസ്ക് പേജ് തുറക്കൂ",
  ],
};

const ACTION_SUGGESTIONS = {
  "en-IN": ["Clock me in", "Request leave"],
  "ml-IN": ["ക്ലോക്ക് ഇൻ ചെയ്യൂ", "ലീവിന് അപേക്ഷിക്കണം"],
};

const TEAM_SUGGESTIONS = {
  "en-IN": ["How's the team doing today?", "Who's on leave today?"],
  "ml-IN": ["ടീം ഇന്ന് എങ്ങനെ പോകുന്നു?", "ഇന്ന് ആരൊക്കെ ലീവിലാണ്?"],
};

const ERROR_UI = {
  "mic-blocked": {
    icon: FiMicOff,
    title: "Microphone is blocked",
    hint: "Click the lock icon in the address bar, allow Microphone, then try again.",
    action: "listen",
  },
  "no-mic": {
    icon: FiMicOff,
    title: "No microphone found",
    hint: "Connect a microphone, or type your question below.",
    action: "listen",
  },
  "no-speech": {
    icon: FiMic,
    title: "I didn't catch that",
    hint: "Tap the mic, wait a moment, then speak clearly.",
    action: "listen",
  },
  "stt-network": {
    icon: FiWifiOff,
    title: "Voice recognition is offline",
    hint: "Browser speech recognition needs an internet connection.",
    action: "listen",
  },
  unsupported: {
    icon: FiMicOff,
    title: "Voice input isn't supported",
    hint: "Use Chrome or Edge, or type your question below.",
  },
  busy: {
    icon: FiClock,
    title: "The AI is busy right now",
    hint: "Free models are rate-limited. Wait a few seconds and try again.",
    action: "retry",
  },
  network: {
    icon: FiWifiOff,
    title: "Can't reach the server",
    hint: "Check your connection and that the API is running.",
    action: "retry",
  },
  failed: {
    icon: FiAlertTriangle,
    title: "Something went wrong",
    hint: "",
    action: "retry",
  },
  "rate-limited": {
    icon: FiClock,
    title: "Slow down a little",
    hint: "",
  },
  "action-failed": {
    icon: FiAlertTriangle,
    title: "That didn't go through",
    hint: "",
  },
  "tts-failed": {
    icon: FiVolumeX,
    title: "Couldn't play the voice reply",
    hint: "Showing the answer as text instead.",
    soft: true,
  },
};

const STATUS_TITLE = {
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
};

const BAR_COUNT = 11;

/* ------------------------------------------------------------------ */
/* Animation driver: one rAF loop feeds motion values (no re-renders)  */
/* ------------------------------------------------------------------ */
const useVisualizer = (status) => {
  const level = useMemo(() => motionValue(0), []);
  const bars = useMemo(
    () => Array.from({ length: BAR_COUNT }, () => motionValue(0)),
    [],
  );

  useEffect(() => {
    if (status === "idle") {
      level.set(0);
      bars.forEach((b) => b.set(0));
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = (now - start) / 1000;
      let lv;
      if (status === "listening") {
        lv = 0.25 + 0.5 * Math.abs(Math.sin(t * 3.1)) * (0.5 + 0.5 * Math.abs(Math.sin(t * 1.1)));
        lv += Math.random() * 0.12;
      } else if (status === "speaking") {
        lv = 0.2 + 0.6 * Math.abs(Math.sin(t * 5.2)) * (0.6 + 0.4 * Math.sin(t * 1.3));
      } else {
        lv = 0.2; // thinking
      }
      level.set(Math.min(1, lv));
      bars.forEach((b, i) => {
        if (status === "thinking") {
          b.set(0.12 + 0.3 * (0.5 + 0.5 * Math.sin(t * 4 - i * 0.7)));
        } else {
          b.set(Math.min(1, lv * (0.35 + 0.65 * Math.abs(Math.sin(t * (3 + i * 0.6) + i * 1.3)))));
        }
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, level, bars]);

  return { level, bars };
};

const Bar = ({ mv }) => {
  const smooth = useSpring(mv, { stiffness: 260, damping: 22 });
  const height = useTransform(smooth, [0, 1], [4, 40]);
  return (
    <motion.span
      style={{ height }}
      className="w-1 rounded-full bg-gradient-to-t from-[#2FAE5A] to-[#B5F07A]"
    />
  );
};

const Waveform = ({ bars, status }) => (
  <div
    className="h-10 flex items-center justify-center gap-1 transition-opacity duration-300"
    style={{ opacity: status === "idle" ? 0.35 : 1 }}
    aria-hidden="true"
  >
    {bars.map((mv, i) => (
      <Bar key={i} mv={mv} />
    ))}
  </div>
);

const ORB_SPEED = { idle: 24, listening: 10, thinking: 5, speaking: 7 };

const Orb = ({ status, level, onClick, label }) => {
  const smooth = useSpring(level, { stiffness: 180, damping: 16 });
  const scale = useTransform(smooth, [0, 1], [1, 1.18]);
  const glow = useTransform(smooth, [0, 1], [0.35, 0.95]);
  const speed = ORB_SPEED[status] || 24;
  const active = status === "listening" || status === "speaking";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="relative w-[136px] h-[136px] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6FD66B] focus-visible:ring-offset-4"
    >
      {/* soft glow */}
      <motion.span
        className="absolute -inset-7 rounded-full bg-[#7ED957] blur-2xl"
        style={{ opacity: glow }}
      />

      {/* ripple rings */}
      {active &&
        [0, 0.7].map((delay) => (
          <motion.span
            key={delay}
            className="absolute inset-0 rounded-full border-2 border-[#6FD66B]"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.75, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay }}
          />
        ))}

      {/* thinking ring */}
      {status === "thinking" && (
        <motion.span
          className="absolute -inset-2 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, rgba(111,214,107,0), #6FD66B)",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* level-driven scale, then idle breathing inside it */}
      <motion.div className="absolute inset-0" style={{ scale }}>
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, #E9FBC4 0%, #8EE06A 40%, #1FA463 85%)",
            boxShadow:
              "inset -10px -14px 28px rgba(8, 80, 50, 0.45), inset 8px 10px 22px rgba(255,255,255,0.35)",
          }}
          animate={status === "idle" ? { scale: [1, 1.035, 1] } : { scale: 1 }}
          transition={{ duration: 4, repeat: status === "idle" ? Infinity : 0, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute -top-3 -left-4 w-20 h-20 rounded-full bg-[#F4FFD0]/90 blur-xl" />
            <span className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full bg-[#0F8F5A]/80 blur-xl" />
          </motion.div>
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: -360 }}
            transition={{ duration: speed * 1.4, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute top-1/3 -right-5 w-16 h-16 rounded-full bg-[#4CD964]/90 blur-lg" />
            <span className="absolute -bottom-4 left-1 w-20 h-20 rounded-full bg-[#B5F07A]/80 blur-xl" />
          </motion.div>
          <span className="absolute top-3 left-6 w-16 h-8 rounded-full bg-white/55 blur-md -rotate-[24deg]" />
        </motion.div>
      </motion.div>
    </button>
  );
};

/* ------------------------------------------------------------------ */
/* Menus                                                               */
/* ------------------------------------------------------------------ */
const Popover = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 4, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 4, scale: 0.97 }}
    transition={{ duration: 0.12 }}
    className={`absolute z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-xs text-[#0B3B2E] ${className}`}
  >
    {children}
  </motion.div>
);

const MenuItem = ({ children, active, onClick }) => (
  <button
    type="button"
    className={`w-full text-left px-3 py-2 hover:bg-[#F1F8F3] flex items-center justify-between gap-2 ${
      active ? "font-semibold" : ""
    }`}
    onClick={onClick}
  >
    {children}
    {active && <span className="text-[#2FAE5A]">✓</span>}
  </button>
);

const ErrorBanner = ({ error, onRetry, onListen, onDismiss }) => {
  const ui = ERROR_UI[error.code] || ERROR_UI.failed;
  const Icon = ui.icon;
  const hint =
    ["failed", "rate-limited", "action-failed"].includes(error.code) && error.message
      ? error.message
      : ui.hint;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      role="alert"
      className={`mb-2 rounded-2xl px-3 py-2.5 flex items-start gap-2.5 ${
        ui.soft ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-700"
      }`}
    >
      <Icon className="mt-0.5 shrink-0" size={15} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold">{ui.title}</p>
        {hint && <p className="text-[11px] opacity-80 leading-snug mt-0.5">{hint}</p>}
        {ui.action && (
          <button
            type="button"
            onClick={ui.action === "retry" ? onRetry : onListen}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold underline underline-offset-2"
          >
            <FiRefreshCw size={10} /> Try again
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="opacity-60 hover:opacity-100"
      >
        <FiX size={13} />
      </button>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */
const readSetting = (key, fallback) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};
const writeSetting = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
};

const AIAssistant = () => {
  const { user } = useAuth();
  const rootRef = useRef(null);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(() => readSetting("aiAssistantModel", ""));
  const [language, setLanguage] = useState(() => {
    const saved = readSetting("aiAssistantLanguage", "auto");
    return LANGUAGES.some((l) => l.value === saved) ? saved : "auto";
  });
  const [ttsVoice, setTtsVoice] = useState(() => {
    const saved = readSetting("aiAssistantVoice", "malayalam");
    return VOICES.some((v) => v.value === saved) ? saved : "malayalam";
  });
  const [showCaptions, setShowCaptions] = useState(
    () => readSetting("aiAssistantCaptions", "0") === "1",
  );
  const [openMenu, setOpenMenu] = useState(null); // "options" | "model" | "language" | null

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pendingNav, setPendingNav] = useState(null);

  // Company switches (an admin can turn the assistant, or only its actions, off)
  const { data: aiStatus } = useQuery({
    queryKey: ["ai-status"],
    queryFn: async () => (await apiClient.get("/ai/status")).data.data,
    staleTime: 60 * 1000,
    retry: 1,
  });
  const canManage = Boolean(aiStatus?.canManage);
  const assistantOff = Boolean(aiStatus && aiStatus.enabled === false);
  const actionsOn = aiStatus ? aiStatus.actionsEnabled !== false : true;
  const firstName = user?.firstName || (user?.name || "").split(" ")[0] || "";

  const {
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
  } = useVoiceAssistant({
    model: model || undefined,
    language,
    ttsVoice,
    // "Open the leads page": wait until the spoken reply is done, then navigate
    onActions: (actions) => {
      const nav = actions.find((a) => a.type === "navigate");
      if (nav) setPendingNav(nav.path);
    },
  });

  const { level, bars } = useVisualizer(status);

  const { data: usage } = useQuery({
    queryKey: ["ai-usage"],
    enabled: canManage && openMenu === "options",
    queryFn: async () => (await apiClient.get("/ai/usage?days=30")).data.data,
    staleTime: 60 * 1000,
  });

  const setCompanySetting = async (patch) => {
    try {
      await apiClient.patch("/ai/settings", patch);
      await queryClient.invalidateQueries({ queryKey: ["ai-status"] });
    } catch {
      /* the switch simply stays as it was */
    }
    setOpenMenu(null);
  };

  const busy = status === "thinking";
  const isEmpty = messages.length === 0 && status === "idle" && !error;
  const lastUserText = [...messages].reverse().find((m) => m.role === "user")?.content;
  const hardError = error && !ERROR_UI[error.code]?.soft ? error : null;
  const softError = error && ERROR_UI[error.code]?.soft ? error : null;
  // Text is hidden by default; show it when the voice reply isn't available
  const captionVisible =
    Boolean(lastReply) && status !== "thinking" && (showCaptions || !voiceReplies || softError);

  // Navigating unmounts this card (and stops the voice), so wait for the reply to finish
  useEffect(() => {
    if (!pendingNav || status === "thinking" || status === "speaking") return undefined;
    const t = setTimeout(() => {
      navigate(pendingNav);
      setPendingNav(null);
    }, 500);
    return () => clearTimeout(t);
  }, [pendingNav, status, navigate]);

  // Close popovers when clicking elsewhere
  useEffect(() => {
    if (!openMenu) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openMenu]);

  const toggleMenu = (name) => setOpenMenu((cur) => (cur === name ? null : name));

  const selectModel = (value) => {
    setModel(value);
    writeSetting("aiAssistantModel", value);
    setOpenMenu(null);
  };

  const selectLanguage = (value) => {
    setLanguage(value);
    writeSetting("aiAssistantLanguage", value);
    setOpenMenu(null);
  };

  const selectVoice = (value) => {
    setTtsVoice(value);
    writeSetting("aiAssistantVoice", value);
    setOpenMenu(null);
    previewVoice(value); // hear it straight away
  };

  const toggleCaptions = () => {
    setShowCaptions((v) => {
      writeSetting("aiAssistantCaptions", v ? "0" : "1");
      return !v;
    });
    setOpenMenu(null);
  };

  const onOrbClick = () => {
    if (assistantOff) return;
    if (status === "speaking") stopSpeaking();
    else if (status === "idle" || status === "listening") toggleListening();
  };

  const orbLabel =
    status === "speaking"
      ? "Tap to stop speaking"
      : status === "listening"
        ? "Tap to stop listening"
        : status === "thinking"
          ? "Thinking"
          : "Tap to talk";

  const submit = (e) => {
    e?.preventDefault();
    if (!input.trim() || busy) return;
    sendMessage(input);
    setInput("");
  };

  const currentModelLabel = MODELS.find((m) => m.value === model)?.label || "Default";
  const currentLanguage = LANGUAGES.find((l) => l.value === language);
  const languageChip =
    language === "auto"
      ? `Auto · ${activeLanguage === "ml-IN" ? "ML" : "EN"}`
      : currentLanguage?.short;
  const langKey = SUGGESTIONS[activeLanguage] ? activeLanguage : "en-IN";
  const isAdmin = user?.role === "company-admin";
  const actionChips = actionsOn ? ACTION_SUGGESTIONS[langKey] : [];
  const suggestions = isAdmin
    ? [...SUGGESTIONS[langKey].slice(0, 2), ...TEAM_SUGGESTIONS[langKey], ...actionChips.slice(0, 1)]
    : [...SUGGESTIONS[langKey].slice(0, actionsOn ? 3 : 5), ...actionChips];

  const stageTitle = assistantOff
    ? "Assistant is off"
    : STATUS_TITLE[status] ||
    (isEmpty ? `${firstName ? `Hi ${firstName}, w` : "W"}hat can I help with?` : "Anything else?");

  // Switched off for the company: everyone except the admin (who can turn it back on) sees nothing
  if (assistantOff && !canManage) return null;

  return (
    <div
      ref={rootRef}
      className="bg-white rounded-[24px] p-4 md:p-5 flex flex-col min-h-[460px] md:h-[500px] relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base text-[#0B3B2E]">AI Assistant</h3>
        <div className="relative">
          <button
            onClick={() => toggleMenu("options")}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[#0B3B2E] hover:bg-gray-50"
            aria-label="Assistant options"
          >
            <FiMoreVertical size={14} />
          </button>
          <AnimatePresence>
            {openMenu === "options" && (
              <Popover className="right-0 top-9 w-56 max-h-[340px] overflow-y-auto">
                <MenuItem
                  active={voiceReplies}
                  onClick={() => {
                    toggleVoiceReplies();
                    setOpenMenu(null);
                  }}
                >
                  Voice replies
                </MenuItem>
                <MenuItem active={showCaptions} onClick={toggleCaptions}>
                  Show reply text
                </MenuItem>
                <div className="my-1 border-t border-gray-100" />
                <p className="px-3 pt-1 pb-0.5 text-[10px] uppercase tracking-wide text-gray-400">
                  Voice
                </p>
                {VOICES.map((v) => (
                  <MenuItem
                    key={v.value}
                    active={v.value === ttsVoice}
                    onClick={() => selectVoice(v.value)}
                  >
                    {v.label}
                  </MenuItem>
                ))}
                <div className="my-1 border-t border-gray-100" />
                <MenuItem
                  onClick={() => {
                    clearChat();
                    setOpenMenu(null);
                  }}
                >
                  Clear conversation
                </MenuItem>
                {canManage && (
                  <>
                    <div className="my-1 border-t border-gray-100" />
                    <p className="px-3 pt-1 pb-0.5 text-[10px] uppercase tracking-wide text-gray-400">
                      Company settings
                    </p>
                    <MenuItem
                      active={!assistantOff}
                      onClick={() => setCompanySetting({ enabled: assistantOff })}
                    >
                      Assistant for the team
                    </MenuItem>
                    <MenuItem
                      active={actionsOn}
                      onClick={() => setCompanySetting({ actionsEnabled: !actionsOn })}
                    >
                      Allow actions
                    </MenuItem>
                    {usage && (
                      <p className="px-3 py-2 text-[10px] text-gray-400 leading-snug">
                        Last 30 days: {usage.requests} requests · ${Number(usage.costUsd).toFixed(3)}
                      </p>
                    )}
                  </>
                )}
              </Popover>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stage */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center gap-2 px-2">
        <Orb status={status} level={level} onClick={onOrbClick} label={orbLabel} />
        <Waveform bars={bars} status={status} />

        <div className="min-h-[56px] flex flex-col items-center gap-1 max-w-[320px]">
          <AnimatePresence mode="wait">
            <motion.h4
              key={stageTitle}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="font-bold text-[#0B3B2E] text-lg leading-tight"
            >
              {stageTitle}
            </motion.h4>
          </AnimatePresence>

          {(status === "thinking" || status === "speaking") && lastUserText && (
            <p className="text-[11px] text-gray-400 line-clamp-1">“{lastUserText}”</p>
          )}
          {status === "speaking" && (
            <p className="text-[11px] text-[#2FAE5A]">Tap the orb to stop</p>
          )}
          {assistantOff && (
            <p className="text-[11px] text-gray-400">
              It&apos;s switched off for your team. Turn it on from the ⋮ menu.
            </p>
          )}
          {isEmpty && !sttSupported && !assistantOff && (
            <p className="text-[11px] text-gray-400">
              Voice input needs Chrome or Edge. You can still type below.
            </p>
          )}
        </div>

        <AnimatePresence>
          {captionVisible && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-h-24 overflow-y-auto text-[13px] leading-snug text-[#0B3B2E] bg-[#F4F8F5] rounded-2xl px-3.5 py-2.5 max-w-[340px] whitespace-pre-wrap"
            >
              {lastReply}
            </motion.p>
          )}
        </AnimatePresence>

        {isEmpty && !assistantOff && (
          <div className="flex flex-wrap justify-center gap-1.5 max-w-[340px] mt-1">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-[10px] text-[#3C5A4D] bg-[#F4F8F5] hover:bg-[#E6F4EA] border border-[#E3EEE7] px-2.5 py-1 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Waiting for the user to confirm an action */}
      <AnimatePresence>
        {pendingAction && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            role="alertdialog"
            aria-label="Confirm action"
            className="mb-2 rounded-2xl border border-[#CFEFD3] bg-[#F1FAF3] px-3 py-2.5"
          >
            <p className="text-[10px] uppercase tracking-wide text-[#2FAE5A] font-semibold">
              Please confirm
            </p>
            <p className="text-[13px] text-[#0B3B2E] leading-snug mt-0.5">{pendingAction.summary}</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={confirmPending}
                className="h-8 px-3 rounded-full bg-gradient-to-r from-[#B5F07A] to-[#6FD66B] text-[#0B3B2E] text-xs font-semibold flex items-center gap-1 hover:brightness-95"
              >
                <FiCheck size={13} /> Confirm
              </button>
              <button
                type="button"
                onClick={cancelPending}
                className="h-8 px-3 rounded-full bg-white border border-[#E3EEE7] text-[#3C5A4D] text-xs font-medium hover:bg-[#F1F8F3]"
              >
                Cancel
              </button>
              <span className="text-[10px] text-gray-400 ml-auto">or say “yes” / “no”</span>
            </div>
          </motion.div>
        )}
        {actionResult?.ok && !pendingAction && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-2 rounded-2xl bg-emerald-50 text-emerald-800 px-3 py-2 flex items-center gap-2 text-xs"
          >
            <FiCheck size={14} className="shrink-0" />
            <span>{actionResult.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Errors */}
      <AnimatePresence>
        {(hardError || softError) && (
          <ErrorBanner
            key={(hardError || softError).code}
            error={hardError || softError}
            onRetry={retry}
            onListen={toggleListening}
            onDismiss={dismissError}
          />
        )}
      </AnimatePresence>

      {/* Composer */}
      <form onSubmit={submit} className="bg-[#F5F8F6] rounded-2xl p-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <HiOutlineSparkles className="text-[#5E7A6C] shrink-0" size={14} />
          <input
            value={status === "listening" ? transcript : input}
            onChange={(e) => setInput(e.target.value)}
            readOnly={status === "listening"}
            placeholder={status === "listening" ? "Listening…" : "Ask anything..."}
            className="flex-1 bg-transparent text-sm text-[#0B3B2E] placeholder:text-gray-400 outline-none min-w-0"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Language */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu("language")}
                className="text-[10px] text-[#3C5A4D] bg-white border border-[#E3EEE7] rounded-full px-2.5 py-1.5 flex items-center gap-1 hover:bg-[#F1F8F3] whitespace-nowrap"
              >
                <FiGlobe size={10} />
                {languageChip}
                <FiChevronDown size={10} />
              </button>
              <AnimatePresence>
                {openMenu === "language" && (
                  <Popover className="bottom-9 left-0 w-48">
                    {LANGUAGES.map((l) => (
                      <MenuItem
                        key={l.value}
                        active={l.value === language}
                        onClick={() => selectLanguage(l.value)}
                      >
                        {l.label}
                      </MenuItem>
                    ))}
                  </Popover>
                )}
              </AnimatePresence>
            </div>

            {/* Model */}
            <div className="relative min-w-0">
              <button
                type="button"
                onClick={() => toggleMenu("model")}
                className="text-[10px] text-[#3C5A4D] bg-white border border-[#E3EEE7] rounded-full px-2.5 py-1.5 flex items-center gap-1 hover:bg-[#F1F8F3] max-w-full"
              >
                <span className="truncate">{currentModelLabel}</span>
                <FiChevronDown size={10} className="shrink-0" />
              </button>
              <AnimatePresence>
                {openMenu === "model" && (
                  <Popover className="bottom-9 left-0 w-56">
                    {MODELS.map((m) => (
                      <MenuItem
                        key={m.value}
                        active={m.value === model}
                        onClick={() => selectModel(m.value)}
                      >
                        {m.label}
                      </MenuItem>
                    ))}
                  </Popover>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleListening}
              disabled={busy || !sttSupported}
              title={sttSupported ? "Speak" : "Voice input not supported in this browser"}
              aria-label={status === "listening" ? "Stop listening" : "Start voice input"}
              className={`w-10 h-10 rounded-full flex items-center justify-center bg-white border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                status === "listening"
                  ? "border-[#2FAE5A] text-white !bg-[#2FAE5A] animate-pulse"
                  : "border-[#E3EEE7] text-[#0B3B2E] hover:bg-[#F1F8F3]"
              }`}
            >
              {status === "listening" ? <FiSquare size={14} /> : <FiMic size={16} />}
            </button>
            <button
              type="submit"
              disabled={!input.trim() || busy || status === "listening"}
              className="h-10 px-4 rounded-full bg-gradient-to-r from-[#B5F07A] to-[#6FD66B] text-[#0B3B2E] text-sm font-semibold flex items-center gap-1.5 shadow-sm hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiArrowUp size={14} />
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AIAssistant;
