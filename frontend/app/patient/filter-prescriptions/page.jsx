"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import PrescriptionFilter from "@/components/PrescriptionFilter";

/**
 * Patient - Filter My Prescriptions Page
 */
export default function FilterPrescriptions() {
  return (
    <ProtectedRoute allowedRoles={["PATIENT"]}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Topbar />
          <div className="bg-white">
            <PrescriptionFilter />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

