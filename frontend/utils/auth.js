"use client";

import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ROLE_KEY,
  USER_KEY,
} from "./constants";

export function saveSession(data) {
  if (typeof window === "undefined") return;

  localStorage.setItem(ACCESS_TOKEN_KEY, data.token || data.accessToken || "");
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken || "");
  localStorage.setItem(ROLE_KEY, data.role || "");

  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      userId: data.userId || "",
      email: data.email || "",
      fullName: data.fullName || "",
    })
  );
}

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export const getAccessToken = getToken;

export function setAccessToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}


export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getRole() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY);
}

export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return !!getToken();
}

export function extendSession() {
  if (typeof window === "undefined") return;
  const user = getUser();
  if (!user) return;
  const expiresAt = Date.now() + 60 * 60 * 1000;
  localStorage.setItem(USER_KEY, JSON.stringify({ ...user, expiresAt }));
}

export function isSessionExpired() {
  if (typeof window === "undefined") return true;
  const user = getUser();
  if (!user) return true;
  if (!user.expiresAt) return false;
  return user.expiresAt < Date.now();
}