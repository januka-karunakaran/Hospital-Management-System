"use client";

import { useEffect, useState } from "react";
import {
  clearSession,
  getAccessToken,
  getRole,
  getRefreshToken,
} from "@/utils/auth";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    const role = getRole();

    if (!accessToken && !refreshToken) {
      clearSession();
      window.location.href = "/login";
      return;
    }

    if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
      if (role === "PATIENT") {
        window.location.href = "/patient/dashboard";
      } else if (role === "DOCTOR") {
        window.location.href = "/doctor/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
      return;
    }

    setReady(true);
  }, [allowedRoles]);

  if (!ready) {
    return <div className="p-6">Loading...</div>;
  }

  return children;
}

