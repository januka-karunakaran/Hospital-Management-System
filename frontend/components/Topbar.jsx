"use client";

import { useRouter } from "next/navigation";
import { getUser, getToken, clearSession } from "@/utils/auth";
import NotificationCenter from "./NotificationCenter";
import { FaSignOutAlt, FaUser, FaCog } from "react-icons/fa";

export default function Topbar() {
  const router = useRouter();
  const user = typeof window !== "undefined" ? getUser() : null;
  const token = typeof window !== "undefined" ? getToken() : null;

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  if (!token) return null;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4 flex justify-between items-center">
        {/* Left side - Greeting */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome, {user?.fullName || "User"}
          </h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-4">
          {/* Notification Center */}
          <NotificationCenter />

          {/* Separator */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Profile Dropdown */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition"
              title="View Profile"
            >
              <FaUser className="text-gray-600" />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Logout"
            >
              <FaSignOutAlt />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
