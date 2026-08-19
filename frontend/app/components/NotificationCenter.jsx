"use client";

import { useCallback, useState, useEffect } from "react";
import { FaBell, FaCheckDouble } from "react-icons/fa";
import { apiFetch } from "@/services/api";
import { getUser } from "@/utils/auth";
import NotificationListener from "./NotificationListener";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const userId = getUser()?.userId;

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await apiFetch("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (err) {
      // Notifications are non-critical. Keep the page usable while the API is
      // restarting or temporarily unavailable.
      console.warn("Notifications are temporarily unavailable:", err.message);
    }
  }, [userId]);

  useEffect(() => {
    const timerId = window.setTimeout(fetchNotifications, 0);
    return () => window.clearTimeout(timerId);
  }, [fetchNotifications]);

  const handleNewNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
    if ("Notification" in window && window.Notification.permission === "granted") {
      new window.Notification(notification.title, { body: notification.message });
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn("Unable to mark notification as read:", err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch("/notifications/read-all", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn("Unable to mark all notifications as read:", err.message);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <NotificationListener onNotificationReceived={handleNewNotification} />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="topbar-icon-btn"
        aria-label="Notifications"
      >
        <FaBell style={{ fontSize: 14 }} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 10px)",
            width: 320, zIndex: 50,
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: 14,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>
                Notifications
                {unreadCount > 0 && (
                  <span className="badge badge-blue" style={{ marginLeft: 8 }}>{unreadCount} new</span>
                )}
              </span>
              <button
                onClick={markAllAsRead}
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--blue)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
              >
                <FaCheckDouble style={{ fontSize: 10 }} /> All read
              </button>
            </div>

            {/* Notifications list */}
            <div style={{ maxHeight: 380, overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 10, color: "var(--text-muted)", opacity: 0.55 }}>
                    <FaBell aria-hidden="true" />
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No notifications yet</div>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)",
                      cursor: "pointer",
                      transition: "background 0.12s",
                      background: !n.isRead ? "rgba(59,130,246,0.06)" : "transparent",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
                    onMouseLeave={e => e.currentTarget.style.background = !n.isRead ? "rgba(59,130,246,0.06)" : "transparent"}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: !n.isRead ? 700 : 600, color: !n.isRead ? "#60a5fa" : "var(--text-primary)" }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0, marginLeft: 8 }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
              <button style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

