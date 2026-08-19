"use client";

import { useEffect, useState } from "react";
import { getUnreadNotifications, markAsRead, deleteNotification } from "@/services/notificationService";
import { getToken, getUser } from "@/utils/auth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { FaBell, FaTimes, FaCheck } from "react-icons/fa";

export default function NotificationCenter() {
  const token = typeof window !== "undefined" ? getToken() : "";
  const user = typeof window !== "undefined" ? getUser() : null;

  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { connected, notifications: wsNotifications, setNotifications: setWsNotifications } = useWebSocket(token, user?.userId);

  // Load initial notifications
  useEffect(() => {
    if (token && user?.userId) {
      loadNotifications();
    }
  }, [token, user?.userId]);

  // Listen for new WebSocket notifications
  useEffect(() => {
    if (wsNotifications.length > 0) {
      setNotifications((prev) => [...wsNotifications, ...prev]);
      updateUnreadCount();
    }
  }, [wsNotifications]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await getUnreadNotifications(token);
      setNotifications(data);
      setUnreadCount(data.length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUnreadCount = () => {
    const unread = notifications.filter((n) => !n.isRead).length;
    setUnreadCount(unread);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId, token);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      updateUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId, token);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      updateUnreadCount();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNavigate = (notification) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
      handleMarkAsRead(notification.id);
      setIsOpen(false);
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "APPOINTMENT":
        return "bg-blue-50 border-l-4 border-blue-500";
      case "PRESCRIPTION":
        return "bg-green-50 border-l-4 border-green-500";
      case "REPORT":
        return "bg-purple-50 border-l-4 border-purple-500";
      case "SYSTEM":
        return "bg-yellow-50 border-l-4 border-yellow-500";
      default:
        return "bg-gray-50 border-l-4 border-gray-500";
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition"
        title="Notifications"
      >
        <FaBell className="text-xl text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {connected && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition ${getNotificationColor(
                    notification.type
                  )} ${!notification.isRead ? "font-semibold" : ""}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div
                      className="flex-1"
                      onClick={() => handleNavigate(notification)}
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Mark as read"
                        >
                          <FaCheck size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="sticky bottom-0 bg-gray-50 border-t p-3 text-center">
              <button
                onClick={() => {
                  loadNotifications();
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Refresh Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
