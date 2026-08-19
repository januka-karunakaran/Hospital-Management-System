"use client";

import { API_BASE } from "@/utils/constants";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "@/utils/auth";
import { refreshAccessToken } from "./authService";

let isRefreshing = false;
let refreshPromise = null;

async function tryRefreshToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken(refreshToken)
    .then((data) => {
      const newToken = data.accessToken || data.token;
      if (!newToken) {
        throw new Error("No new access token returned");
      }
      setAccessToken(newToken);
      return newToken;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function apiFetch(endpoint, options = {}, retry = true) {
  const accessToken = getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const sendRequest = () => fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let response;
  try {
    response = await sendRequest();
  } catch {
    // A dev backend restart briefly drops active connections. Retry once so
    // every page does not remain stuck in a failed state after that short gap.
    await new Promise((resolve) => setTimeout(resolve, 700));
    try {
      response = await sendRequest();
    } catch {
      throw new Error("Unable to connect to the hospital server. Please try again.");
    }
  }

  if (response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  }

  if ((response.status === 401 || response.status === 403) && retry) {
    try {
      const newAccessToken = await tryRefreshToken();

      return apiFetch(
        endpoint,
        {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${newAccessToken}`,
          },
        },
        false,
      );
    } catch (refreshError) {
      clearSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw refreshError;
    }
  }

  const contentType = response.headers.get("content-type");
  let errorData = null;

  if (contentType && contentType.includes("application/json")) {
    errorData = await response.json();
  } else {
    errorData = await response.text();
  }

  const errorMessage =
    typeof errorData === "string"
      ? errorData
      : errorData?.message || errorData?.error;

  throw new Error(errorMessage || `Request failed (${response.status})`);
}
