"use client";

import { useEffect } from "react";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearSession,
} from "@/utils/auth";
import { refreshAccessToken } from "@/services/authService";

export default function SilentLogin() {
  useEffect(() => {
    const runSilentLogin = async () => {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (accessToken) return;

      if (!refreshToken) return;

      try {
        const data = await refreshAccessToken(refreshToken);
        const newToken = data.accessToken || data.token;

        if (newToken) {
          setAccessToken(newToken);
        }
      } catch (error) {
        clearSession();
      }
    };

    runSilentLogin();
  }, []);

  return null;
}

