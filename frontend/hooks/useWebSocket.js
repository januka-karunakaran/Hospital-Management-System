"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080";

export function useWebSocket(token, userId) {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token || !userId) return;

    try {
      // Connect to WebSocket
      socketRef.current = io(WS_URL, {
        auth: {
          token: token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Connection events
      socketRef.current.on("connect", () => {
        console.log("WebSocket connected");
        setConnected(true);

        // Subscribe to user's notification queue
        socketRef.current.emit("subscribe", { userId: userId });
      });

      socketRef.current.on("disconnect", () => {
        console.log("WebSocket disconnected");
        setConnected(false);
      });

      // Receive notifications
      socketRef.current.on("notification", (notification) => {
        console.log("New notification received:", notification);
        setNotifications((prev) => [notification, ...prev]);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
    }
  }, [token, userId]);

  const emit = (event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    connected,
    notifications,
    setNotifications,
    emit,
    socket: socketRef.current,
  };
}
