import React, { useRef, useState, useEffect } from "react";
import MentionAutocomplete from "./MentionAutocomplete";
import ReplyPreview from "./ReplyPreview";

const ChatInput = ({
  messageInput,
  onInputChange,
  onKeyPress,
  onSendMessage,
  onFileUpload,
  onTyping,
  isTyping,
  disabled = false,
  participants = [],
  onMentionSelect,
  replyingTo = null,
  onCancelReply,
}) => {
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const inputRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false);
  const [mentionSearchTerm, setMentionSearchTerm] = useState("");
  const [mentionCursorPosition, setMentionCursorPosition] = useState(0);

  const handleInputChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;

    onInputChange(e);

    // Trigger typing indicator
    if (onTyping) {
      onTyping(value.length > 0);
    }

    // Detect @ mention
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if there's no space after @ (actively typing a mention)
      if (!textAfterAt.includes(" ") && textAfterAt.length >= 0) {
        setShowMentionAutocomplete(true);
        setMentionSearchTerm(textAfterAt);
        setMentionCursorPosition(lastAtIndex);
      } else {
        setShowMentionAutocomplete(false);
      }
    } else {
      setShowMentionAutocomplete(false);
    }
  };

  const handleMentionSelect = (user) => {
    const beforeMention = messageInput.substring(0, mentionCursorPosition);
    const afterMention = messageInput.substring(
      inputRef.current.selectionStart
    );

    // Create mention text with format: @[userId](userName)
    const mentionText = `@${user.firstName} ${user.lastName}`;
    const newValue = beforeMention + mentionText + " " + afterMention;

    // Create synthetic event for onInputChange
    const syntheticEvent = {
      target: {
        value: newValue,
        selectionStart: beforeMention.length + mentionText.length + 1,
      },
    };

    onInputChange(syntheticEvent);
    setShowMentionAutocomplete(false);

    // Call parent mention handler if provided
    if (onMentionSelect) {
      onMentionSelect(user, mentionText);
    }

    // Focus back on input
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = beforeMention.length + mentionText.length + 1;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach((track) => track.stop()); // Stop the stream immediately
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setHasPermission(false);
    }
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      console.log("=== VOICE RECORDING DEBUG ===");
      console.log("1. Checking MediaRecorder support:", !!window.MediaRecorder);
      console.log(
        "2. Checking getUserMedia support:",
        !!navigator.mediaDevices?.getUserMedia
      );

      if (!window.MediaRecorder) {
        alert("MediaRecorder not supported in this browser");
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        alert("getUserMedia not supported in this browser");
        return;
      }

      console.log("3. Requesting microphone permission...");

      // Request microphone permission and get stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true, // Simplified audio constraints
      });

      console.log("4. Got stream:", stream);
      console.log("5. Stream tracks:", stream.getTracks().length);

      setHasPermission(true);
      audioChunksRef.current = [];

      // Create MediaRecorder with proper MIME type
      let options = null;

      // Check for supported MIME types in order of preference
      const supportedTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/wav",
        "audio/ogg",
      ];

      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          options = { mimeType: type };
          console.log("6. Using MIME type:", type);
          break;
        }
      }

      if (!options) {
        console.log("6. No specific MIME type supported, using default");
      }
      mediaRecorderRef.current = options
        ? new MediaRecorder(stream, options)
        : new MediaRecorder(stream);
      console.log("7. MediaRecorder created:", mediaRecorderRef.current);

      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log("8. Data available:", event.data.size, "bytes");
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log("9. Total chunks:", audioChunksRef.current.length);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        console.log(
          "10. Recording stopped, total chunks:",
          audioChunksRef.current.length
        );

        if (audioChunksRef.current.length > 0) {
          // Use the correct MIME type based on what was recorded
          const mimeType = mediaRecorderRef.current.mimeType || "audio/webm";
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeType,
          });

          console.log(
            "11. Created blob:",
            audioBlob.size,
            "bytes, type:",
            mimeType
          );

          // Create file with proper extension
          const extension = mimeType.includes("webm")
            ? "webm"
            : mimeType.includes("mp4")
            ? "mp4"
            : mimeType.includes("wav")
            ? "wav"
            : "ogg";
          const audioFile = new File(
            [audioBlob],
            `voice-message-${Date.now()}.${extension}`,
            { type: mimeType }
          );

          console.log(
            "12. Created audio file:",
            audioFile.name,
            audioFile.size,
            "bytes"
          );

          // Send voice message
          if (onFileUpload) {
            console.log("13. Sending voice message...");
            onFileUpload(audioFile, { isAudio: true, isVoice: true });
          }
        } else {
          console.log("11. No audio data recorded!");
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error("14. MediaRecorder error:", event.error);
        setIsRecording(false);
        setRecordingTime(0);
      };

      mediaRecorderRef.current.onstart = () => {
        console.log("15. MediaRecorder started successfully");
      };

      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      console.log("16. Recording started successfully");
    } catch (error) {
      console.error("ERROR starting recording:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);

      setHasPermission(false);

      if (error.name === "NotAllowedError") {
        alert(
          "Microphone access denied. Please allow microphone access in your browser settings."
        );
      } else if (error.name === "NotFoundError") {
        alert("No microphone found. Please connect a microphone.");
      } else if (error.name === "NotSupportedError") {
        alert(
          "Voice recording not supported in this browser. Please use Chrome, Firefox, or Edge."
        );
      } else {
        alert("Error starting voice recording: " + error.message);
      }
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    console.log("Stopping recording...");
    if (mediaRecorderRef.current && isRecording) {
      // Check minimum recording time (1 second)
      if (recordingTime < 1) {
        console.log("Recording too short, not sending");
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setRecordingTime(0);
        return;
      }

      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      console.log("Recording stopped");
    }
  };

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Recording timer effect
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((time) => time + 1);
      }, 1000);
    } else if (!isRecording && recordingTime !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, recordingTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onFileUpload) {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert("File size must be less than 10MB");
        e.target.value = "";
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/avi",
        "video/mov",
        "video/wmv",
        "audio/mp3",
        "audio/wav",
        "audio/ogg",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/zip",
        "application/x-rar-compressed",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(
          "File type not supported. Please select an image, video, audio, document, or archive file."
        );
        e.target.value = "";
        return;
      }

      // Determine file category for better handling
      const fileCategory = {
        isImage: file.type.startsWith("image/"),
        isVideo: file.type.startsWith("video/"),
        isAudio: file.type.startsWith("audio/"),
        isDocument:
          file.type.includes("pdf") ||
          file.type.includes("document") ||
          file.type.includes("text"),
        isArchive: file.type.includes("zip") || file.type.includes("rar"),
      };

      onFileUpload(file, fileCategory);
    }
    // Reset file input
    e.target.value = "";
  };

  return (
    <div className="border-t border-gray-200">
      {/* Reply Preview */}
      {replyingTo && (
        <ReplyPreview replyingTo={replyingTo} onCancel={onCancelReply} />
      )}

      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* File upload button */}
          <button
            onClick={handleFileClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={disabled || isRecording}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          {/* Voice recording button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-lg transition-colors ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            disabled={disabled}
          >
            {isRecording ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>

          {/* Recording timer */}
          {isRecording && (
            <div className="flex items-center gap-2 text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          />

          <div className="flex-1 relative">
            {/* Mention Autocomplete */}
            <MentionAutocomplete
              participants={participants}
              searchTerm={mentionSearchTerm}
              onSelectUser={handleMentionSelect}
              visible={showMentionAutocomplete}
              position={{ bottom: 60, left: 0 }}
            />

            <input
              ref={inputRef}
              type="text"
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={onKeyPress}
              placeholder="Type your message... (@mention someone)"
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isTyping || disabled || isRecording}
            />
            {messageInput.length > 0 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-gray-400">
                  {messageInput.length}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onSendMessage}
            disabled={!messageInput.trim() || isTyping || disabled}
            className={`p-2 rounded-lg transition-all ${
              messageInput.trim() && !isTyping && !disabled
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isTyping ? (
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
