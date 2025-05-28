import React, { useState, useEffect } from "react";
import socketService from "../../services/socketService";

const SocketDebugger = () => {
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [logs, setLogs] = useState([]);
  const [testMessage, setTestMessage] = useState("");

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { message, type, timestamp }]);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    addLog(
      `User: ${user.firstName} ${user.lastName} (${user._id || user.id})`,
      "info"
    );
    addLog(
      `Token: ${token ? "Available" : "Missing"}`,
      token ? "success" : "error"
    );

    if (token) {
      addLog("Attempting to connect to socket...", "info");
      socketService.connect(token);

      // Monitor connection status
      const socket = socketService.getSocket();
      if (socket) {
        socket.on("connect", () => {
          setConnectionStatus("connected");
          addLog("✅ Socket connected successfully", "success");
        });

        socket.on("disconnect", (reason) => {
          setConnectionStatus("disconnected");
          addLog(`❌ Socket disconnected: ${reason}`, "error");
        });

        socket.on("connect_error", (error) => {
          setConnectionStatus("error");
          addLog(`❌ Connection error: ${error.message}`, "error");
        });

        // Monitor chat events
        socket.on("new_message", (data) => {
          addLog(`📨 New message received: ${data.content}`, "success");
        });

        socket.on("user_online", (data) => {
          addLog(`🟢 User online: ${data.name}`, "info");
        });

        socket.on("user_offline", (userId) => {
          addLog(`🔴 User offline: ${userId}`, "info");
        });

        socket.on("error", (error) => {
          addLog(`❌ Socket error: ${error.message}`, "error");
        });
      }
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const testConnection = () => {
    const socket = socketService.getSocket();
    if (socket) {
      addLog("Testing socket connection...", "info");
      setConnectionStatus(socket.connected ? "connected" : "disconnected");
      addLog(
        `Socket connected: ${socket.connected}`,
        socket.connected ? "success" : "error"
      );
    } else {
      addLog("No socket instance found", "error");
    }
  };

  const sendTestMessage = () => {
    if (!testMessage.trim()) {
      addLog("Please enter a test message", "error");
      return;
    }

    const messageData = {
      conversationId: "test",
      content: testMessage,
      type: "text",
    };

    addLog(`Sending test message: ${testMessage}`, "info");
    socketService.sendMessage(messageData);
    setTestMessage("");
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-600";
      case "disconnected":
        return "text-red-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">Socket Connection Debugger</h3>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium">Status:</span>
          <span className={`font-semibold ${getStatusColor()}`}>
            {connectionStatus.toUpperCase()}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={testConnection}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Test Connection
          </button>
          <button
            onClick={clearLogs}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Clear Logs
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter test message..."
            className="flex-1 px-3 py-1 border rounded text-sm"
            onKeyPress={(e) => e.key === "Enter" && sendTestMessage()}
          />
          <button
            onClick={sendTestMessage}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Send Test
          </button>
        </div>
      </div>

      <div className="border rounded p-3 h-64 overflow-y-auto bg-gray-50">
        <h4 className="font-medium mb-2">Debug Logs:</h4>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm">No logs yet...</p>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-xs">
                <span className="text-gray-400">[{log.timestamp}]</span>
                <span className={`ml-2 ${getLogColor(log.type)}`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocketDebugger;
