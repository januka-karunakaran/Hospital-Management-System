"use client";

import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getUser } from "@/utils/auth";
import { WS_BASE } from "@/utils/constants";

export default function NotificationListener({ onNotificationReceived }) {
  const stompClientRef = useRef(null);
  const userId = getUser()?.userId;

  useEffect(() => {
    if (!userId) return;
    
    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_BASE}/ws/notifications`),
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      console.log("Connected to WebSocket: " + frame);
      
      // Subscribe to user's private notification queue
      // Spring convertAndSendToUser sends to /user/{username}/queue/notifications
      client.subscribe(`/user/${userId}/queue/notifications`, (message) => {
        const notification = JSON.parse(message.body);
        console.log("New notification:", notification);
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [onNotificationReceived, userId]);

  return null;
}
