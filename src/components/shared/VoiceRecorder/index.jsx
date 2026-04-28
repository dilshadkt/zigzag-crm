import React, { useState, useRef, useEffect } from "react";
import { FiMic, FiSquare, FiPlay, FiTrash2, FiSend, FiSettings, FiVolume2 } from "react-icons/fi";
import Modal from "../modal";

const VoiceRecorder = ({ isOpen, onClose, onUpload, isUploading }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mimeType, setMimeType] = useState("");
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("default");
  const [showSettings, setShowSettings] = useState(false);
  const [isSilenced, setIsSilenced] = useState(true); // To check if any audio signal is detected
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const previewAudioRef = useRef(null);

  // Enum devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = allDevices.filter(d => d.kind === "audioinput");
        setDevices(audioInputs);
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    };

    if (isOpen) {
      getDevices();
      // Reset state when opening
      setRecordingTime(0);
      setIsRecording(false);
      setAudioUrl(null);
      setAudioBlob(null);
    }
  }, [isOpen]);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const startVisualizer = (stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      
      // Ensure context is resumed if suspended
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;
      audioContextRef.current = audioContext;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;

        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, width, height);
        
        const barWidth = (width / bufferLength) * 2;
        let x = 0;
        let totalVal = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;
          totalVal += dataArray[i];
          
          ctx.fillStyle = `rgb(59, 130, 246)`; // Blue-500
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);
          x += barWidth + 2;
        }

        // Check if there is actual sound
        if (totalVal > 0) {
          setIsSilenced(false);
        } else {
          setIsSilenced(true);
        }
      };

      draw();
    } catch (e) {
      console.error("Visualizer error:", e);
    }
  };

  const stopVisualizer = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
    }
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support audio recording.");
      }

      console.log("Starting recording with device:", selectedDeviceId);
      
      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };

      if (selectedDeviceId && selectedDeviceId !== "default") {
        audioConstraints.deviceId = { exact: selectedDeviceId };
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      
      if (!stream || stream.getAudioTracks().length === 0) {
        throw new Error("No audio track found. Please check your microphone.");
      }

      streamRef.current = stream;
      audioChunksRef.current = [];

      startVisualizer(stream);

      // MIME types check
      const types = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/wav",
      ];
      let type = "";
      for (const t of types) {
        if (MediaRecorder.isTypeSupported(t)) {
          type = t;
          break;
        }
      }
      setMimeType(type);

      const mediaRecorder = new MediaRecorder(stream, type ? { mimeType: type } : {});
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, { type: type || "audio/webm" });
        const url = URL.createObjectURL(finalBlob);
        setAudioBlob(finalBlob);
        setAudioUrl(url);
        
        // Stop the visualizer and all streams
        stopVisualizer();
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      // Start recording with a timeslice to ensure data is captured periodically
      mediaRecorder.start(200); 
      setIsRecording(true);
      setRecordingTime(0);
      setAudioUrl(null);
      setAudioBlob(null);
      setIsSilenced(true); // Reset silence check
    } catch (err) {
      console.error("Start recording error:", err);
      alert("Error: " + (err.message || "Microphone access failed. Try selecting a different device."));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCleanup = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    stopVisualizer();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleClose = () => {
    handleCleanup();
    onClose();
  };

  const handleSend = () => {
    if (!audioBlob || audioBlob.size === 0) {
      alert("No audio data was captured. Please ensure your microphone is working.");
      return;
    }

    const ext = mimeType.includes("webm") ? "webm" : mimeType.includes("mp4") ? "mp4" : "wav";
    const file = new File([audioBlob], `voice-${Date.now()}.${ext}`, { type: mimeType || "audio/webm" });
    
    onUpload(file);
    handleCleanup();
    onClose();
  };

  const togglePlay = () => {
    if (previewAudioRef.current) {
      if (isPlaying) {
        previewAudioRef.current.pause();
      } else {
        previewAudioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Safe time formatting
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Effect for cleaning up when closing externally
  useEffect(() => {
    if (!isOpen) {
      handleCleanup();
      setIsPlaying(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Record Voice Message" size="sm">
      <div className="flex flex-col items-center justify-center py-6 space-y-6">
        {!audioUrl ? (
          <>
            {/* Visualizer & Timer */}
            <div className="w-full flex flex-col items-center justify-center space-y-4">
              <div className="relative w-full h-24 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full opacity-60"
                  width={400}
                  height={100}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <p className="text-4xl font-bold text-gray-800 tabular-nums">
                    {formatTime(recordingTime)}
                  </p>
                </div>
              </div>
              
              {isRecording && isSilenced && (
                <div className="flex items-center gap-1.5 text-orange-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                   <FiVolume2 /> No Sound Detected
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-6 w-full">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`group relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200"
                    : "bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200"
                }`}
              >
                {isRecording ? (
                  <FiSquare className="text-white w-8 h-8" />
                ) : (
                  <FiMic className="text-white w-8 h-8" />
                )}
                {isRecording && (
                    <span className="absolute -inset-2 rounded-full border-2 border-red-200 animate-ping opacity-25"></span>
                )}
              </button>

              <div className="w-full px-4 text-center">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-[10px] font-bold text-gray-400 hover:text-blue-500 uppercase tracking-widest flex items-center justify-center gap-1.5 mx-auto transition-colors"
                >
                  <FiSettings className={showSettings ? "animate-spin-slow" : ""} />
                  {showSettings ? "Hide Mic Settings" : "Change Microphone"}
                </button>

                {showSettings && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">
                      Input Device
                    </label>
                    <select
                      className="w-full text-xs font-medium bg-white border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-300 transition-all appearance-none cursor-pointer"
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      disabled={isRecording}
                    >
                      <option value="default">Default System Mic</option>
                      {devices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Mic ${device.deviceId.slice(0, 5)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Preview Section */}
            <div className="w-full px-4 space-y-6">
              <div className="text-center">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Preview Message</p>
                <p className="text-lg font-bold text-gray-800">Voice Note • {formatTime(recordingTime)}</p>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={togglePlay}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isPlaying 
                      ? "bg-orange-500 text-white shadow-orange-100" 
                      : "bg-blue-600 text-white shadow-blue-100"
                  }`}
                >
                  {isPlaying ? (
                    <FiSquare className="w-6 h-6 fill-current" />
                  ) : (
                    <FiPlay className="w-6 h-6 fill-current ml-1" />
                  )}
                </button>

                <div className="w-full bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
                  <audio 
                    ref={previewAudioRef}
                    src={audioUrl} 
                    className="w-full" 
                    onEnded={handleAudioEnded}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    controls
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full px-4 pt-2">
              <button
                onClick={handleCleanup}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                disabled={isUploading}
              >
                <FiTrash2 /> Discard
              </button>
              <button
                onClick={handleSend}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FiSend /> Send Message
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default VoiceRecorder;
