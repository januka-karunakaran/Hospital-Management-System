"use client";

import { API_BASE } from "../utils/constants";

/**
 * Get all notifications
 */
export async function getNotifications(token) {
  const res = await fetch(`${API_BASE}/notifications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to fetch notifications");
  }

  return data;
}

/**
 * Get unread notifications only
 */
export async function getUnreadNotifications(token) {
  const res = await fetch(`${API_BASE}/notifications/unread`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to fetch unread notifications");
  }

  return data;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(token) {
  const res = await fetch(`${API_BASE}/notifications/unread/count`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to fetch unread count");
  }

  return data.unreadCount;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId, token) {
  const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to mark notification as read");
  }

  return data;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(token) {
  const res = await fetch(`${API_BASE}/notifications/read-all`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to mark all as read");
  }

  return data;
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId, token) {
  const res = await fetch(`${API_BASE}/notifications/${notificationId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to delete notification");
  }

  return data;
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(token) {
  const res = await fetch(`${API_BASE}/notifications`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to delete all notifications");
  }

  return data;
}
