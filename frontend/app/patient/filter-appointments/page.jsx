"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import AppointmentFilter from "@/components/AppointmentFilter";

/**
 * Patient - Filter My Appointments Page
 */
export default function FilterAppointments() {
  return (
    <ProtectedRoute allowedRoles={["PATIENT"]}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Topbar />
          <div className="bg-white">
            <AppointmentFilter />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

