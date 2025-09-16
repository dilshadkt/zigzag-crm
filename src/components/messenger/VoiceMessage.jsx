import React, { useState, useRef, useEffect } from "react";

const VoiceMessage = ({ attachment, isOwn }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
          setIsLoading(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const getProgressPercentage = () => {
    if (duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg max-w-xs ${
        isOwn ? "bg-blue-400 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Play/Pause button */}
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isOwn
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        } ${isLoading ? "opacity-50" : ""}`}
      >
        {isLoading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 ml-0.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Progress bar and time */}
      <div className="flex-1 min-w-0">
        {/* Progress bar */}
        <div
          className="w-full h-2 bg-gray-300 rounded-full cursor-pointer mb-1"
          onClick={handleSeek}
        >
          <div
            className={`h-full rounded-full transition-all ${
              isOwn ? "bg-blue-600" : "bg-gray-500"
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Time display */}
        <div className="flex justify-between text-xs">
          <span className={isOwn ? "text-blue-100" : "text-gray-500"}>
            {formatTime(currentTime)}
          </span>
          <span className={isOwn ? "text-blue-100" : "text-gray-500"}>
            {formatTime(duration)}
          </span>
        </div>

        {/* File info */}
        <div className="text-xs mt-1 opacity-75">🎵 Voice Message</div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={attachment.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
    </div>
  );
};

export default VoiceMessage;
