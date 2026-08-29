let audioContext = null;

export const unlockNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioContext) {
      audioContext = new AudioCtx();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }
  } catch {
    // Ignore
  }
};

export const playNotificationSound = () => {
  try {
    unlockNotificationSound();
    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioContext.currentTime);
    gain.gain.setValueAtTime(0.12, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.25);
  } catch {
    // Ignore audio playback errors
  }
};

export const handleTaskStatusChanged = (data, queryClient) => {
  if (!data?.isSubtask) return;
  queryClient.invalidateQueries({ queryKey: ["employeeSubTasksToday"] });
};

