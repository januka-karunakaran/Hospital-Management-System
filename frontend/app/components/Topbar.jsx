"use client";

import { getRole, getUser } from "@/utils/auth";
import ThemeToggle from "./ThemeToggle";
import NotificationCenter from "./NotificationCenter";
import SearchInput from "./SearchInput";

export default function Topbar({ title, subtitle }) {
  const user = getUser();
  const role = getRole();

  return (
    <div className="topbar" style={{ borderRadius: 14, marginBottom: 0, position: "relative", top: "auto" }}>
      {/* Left: title or search */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{ flexShrink: 0 }}>
            <div className="topbar-title">{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{subtitle}</div>}
          </div>
        )}
        <div style={{ flex: 1, maxWidth: 380 }}>
          <SearchInput />
        </div>
      </div>

      {/* Right: actions */}
      <div className="topbar-right">
        <NotificationCenter />
        <ThemeToggle />
        <div style={{ width: 1, height: 28, background: "var(--border-strong)", margin: "0 4px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="topbar-avatar">
            {(user?.fullName || "U")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
              {user?.fullName || "User"}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {role || "â€”"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

