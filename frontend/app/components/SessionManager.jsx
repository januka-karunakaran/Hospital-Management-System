"use client";

import { useEffect } from "react";
import {
  clearSession,
  extendSession,
  getUser,
  isSessionExpired,
} from "@/utils/auth";
import { WARNING_BEFORE_LOGOUT_MS } from "@/app/utils/constants";

export default function SessionManager() {
  useEffect(() => {
    const activityEvents = ["click", "keydown", "mousemove", "scroll"];

    const handleActivity = () => {
      extendSession();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    const interval = setInterval(() => {
      const user = getUser();

      if (!user?.expiresAt) return;

      const timeLeft = user.expiresAt - Date.now();

      if (timeLeft <= 0 || isSessionExpired()) {
        alert("Session expired. Please login again.");
        clearSession();
        window.location.href = "/login";
      } else if (timeLeft <= WARNING_BEFORE_LOGOUT_MS) {
        console.log("Session will expire soon");
      }
    }, 5000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(interval);
    };
  }, []);

  return null;
}

