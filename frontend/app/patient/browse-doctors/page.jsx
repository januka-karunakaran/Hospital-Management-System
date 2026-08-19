"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import DoctorSearch from "@/components/DoctorSearch";

/**
 * Patient - Browse and Search Doctors Page
 */
export default function BrowseDoctors() {
  return (
    <ProtectedRoute allowedRoles={["PATIENT"]}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Topbar />
          <div className="bg-white">
            <DoctorSearch />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

