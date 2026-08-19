"use client";

import { API_BASE } from "../utils/constants";

/**
 * Get current user's profile
 */
export async function getMyProfile(token) {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to fetch profile");
  }

  return data;
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId, token) {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to fetch user profile");
  }

  return data;
}

/**
 * Update current user's profile
 */
export async function updateMyProfile(profileData, token) {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to update profile");
  }

  return data;
}

/**
 * Update another user's profile (Admin only)
 */
export async function updateUserProfile(userId, profileData, token) {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to update user profile");
  }

  return data;
}
