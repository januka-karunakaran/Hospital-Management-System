"use client";

import { API_BASE } from "@/utils/constants";

export async function loginUser(loginData) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Login failed");
  }

  return data;
}

export async function registerUser(registerData) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerData),
  });

  const contentType = res.headers.get("content-type");

  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || data || "Register failed");
  }

  return data;
}

export async function refreshAccessToken(refreshToken) {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Token refresh failed");
  }

  return data;
}

export async function logoutUser(refreshToken) {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Logout failed");
  }

  return true;
}

export async function sendSignupOtp(email) {
  const res = await fetch(`${API_BASE}/auth/signup/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.text();
  if (!res.ok) {
    try {
      const parsed = JSON.parse(data);
      throw new Error(parsed.message || "Unable to send verification code");
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error(data || "Unable to send verification code");
      throw error;
    }
  }
  return data;
}
