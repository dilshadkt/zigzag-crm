import React, { useState, useRef, useEffect } from "react";
import { updateAttachmentDuration } from "../../api/chatService";

const VoiceMessage = ({ attachment, isOwn, messageId, attachmentIndex }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(attachment.duration || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [metadataError, setMetadataError] = useState(false);
  const [isUnsupportedFormat, setIsUnsupportedFormat] = useState(false);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current || isUnsupportedFormat) return;

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
          if (
            error.name === "NotSupportedError" ||
            error.message?.includes("supported sources")
          ) {
            setIsUnsupportedFormat(true);
          }
          setIsLoading(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = async () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      if (audioDuration && !isNaN(audioDuration) && isFinite(audioDuration)) {
        setDuration(audioDuration);
        setMetadataError(false);

        // Update the database with the extracted duration if it's not already stored
        if (
          !attachment.duration &&
          messageId &&
          attachmentIndex !== undefined
        ) {
          try {
            await updateAttachmentDuration(
              messageId,
              attachmentIndex,
              audioDuration
            );
            console.log(
              "✅ Updated voice message duration in database:",
              audioDuration
            );
          } catch (error) {
            console.warn("⚠️ Failed to update duration in database:", error);
          }
        }
      } else {
        setMetadataError(true);
        // Keep the stored duration if metadata fails
        if (attachment.duration) {
          setDuration(attachment.duration);
        }
      }
    }
  };

  const handleMetadataError = () => {
    setMetadataError(true);
    setIsUnsupportedFormat(true);
    console.warn("Failed to load audio metadata for:", attachment.url);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || isUnsupportedFormat) return;

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

  useEffect(() => {
    if (!audioRef.current) return;

    const audioElement = audioRef.current;
    const mimeType = attachment.mimetype || attachment.mimeType || "";

    // Trigger a fresh load for new sources
    audioElement.pause();
    audioElement.currentTime = 0;
    audioElement.load();

    if (mimeType && typeof audioElement.canPlayType === "function") {
      const supportLevel = audioElement.canPlayType(mimeType);
      setIsUnsupportedFormat(supportLevel === "");
    } else {
      setIsUnsupportedFormat(false);
    }

    setIsPlaying(false);
    setCurrentTime(0);
    setMetadataError(false);
  }, [attachment.url, attachment.mimetype, attachment.mimeType]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = attachment.url;
    link.download =
      attachment.originalName || attachment.filename || "voice-message";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        disabled={isLoading || isUnsupportedFormat}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isOwn
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        } ${isLoading || isUnsupportedFormat ? "opacity-50" : ""}`}
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
          className={`w-full h-2 rounded-full mb-1 ${
            isUnsupportedFormat
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-gray-300 cursor-pointer"
          }`}
          onClick={isUnsupportedFormat ? undefined : handleSeek}
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
            {metadataError && attachment.duration && (
              <span className="ml-1 opacity-75" title="Using stored duration">
                *
              </span>
            )}
          </span>
        </div>

        {/* File info */}
        <div className="text-xs mt-1 opacity-75">
          🎵 Voice Message
          {metadataError && !attachment.duration && (
            <span className="ml-1 text-red-400" title="Duration unavailable">
              ⚠️
            </span>
          )}
          {isUnsupportedFormat && (
            <span className="ml-1 text-red-400" title="Download to listen">
              (Browser can't play this format)
            </span>
          )}
        </div>

        {isUnsupportedFormat && (
          <button
            onClick={handleDownload}
            className={`mt-2 inline-flex items-center gap-1 text-xs font-medium underline ${
              isOwn ? "text-blue-100" : "text-blue-600"
            }`}
          >
            Download audio
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v12m0 0l-4-4m4 4l4-4m5 6H7a2 2 0 01-2-2V5"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleMetadataError}
        onEnded={handleEnded}
        preload="metadata"
        crossOrigin="anonymous"
      >
        <source
          src={attachment.url}
          type={attachment.mimetype || attachment.mimeType || "audio/mpeg"}
        />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default VoiceMessage;
