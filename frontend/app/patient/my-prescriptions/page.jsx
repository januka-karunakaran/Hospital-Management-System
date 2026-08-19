"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { getUser } from "@/utils/auth";
import { getPrescriptionsByPatient, downloadPrescriptionPdf } from "@/services/prescriptionService";
import { getAllDoctors } from "@/services/appointmentService";
import { FaPrescription, FaPrint, FaDownload, FaUserMd, FaNotesMedical, FaCalendarAlt, FaIdCard } from "react-icons/fa";

export default function PatientMyPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const user = typeof window !== "undefined" ? getUser() : null;

  useEffect(() => {
    if (!user?.userId) return;

    let cancelled = false;
    const loadData = async () => {
      try {
        setLoading(true);
        const [prescriptionData, doctorData] = await Promise.all([
          getPrescriptionsByPatient(user.userId),
          getAllDoctors(),
        ]);

        if (!cancelled) {
          setPrescriptions(prescriptionData);
          setDoctors(doctorData);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load prescriptions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timerId = window.setTimeout(loadData, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [user?.userId]);

  const doctorMap = useMemo(() => {
    const map = {};
    doctors.forEach((doctor) => {
      map[doctor.id] = doctor;
    });
    return map;
  }, [doctors]);

  const handlePrint = (prescriptionId) => {
    const printContent = document.getElementById(
      `print-prescription-${prescriptionId}`,
    );
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #111827;
            }
            h1 {
              margin-bottom: 20px;
            }
            .card {
              border: 1px solid #d1d5db;
              border-radius: 12px;
              padding: 20px;
            }
            ul {
              padding-left: 20px;
            }
            p {
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0a0e1a] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["PATIENT"]}>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Topbar />

          <div className="page-content">
            {/* Header */}
            <div className="page-header">
              <h1>My Prescriptions</h1>
              <p>Access your electronic prescriptions, pharmacy orders, and dosage logs</p>
            </div>

            {error && (
              <div className="badge-red" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", textTransform: "none" }}>
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="grid-2">
              {prescriptions.map((item) => {
                const doctor = doctorMap[item.doctorId];

                return (
                  <div key={item.id} className="card fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px", borderLeft: "4px solid var(--emerald)" }}>
                    <div id={`print-prescription-${item.id}`} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(16,185,129,0.1)", color: "var(--emerald)", display: "flex", alignItems: "center", justifySpace: "center", justifyContent: "center" }}>
                            <FaPrescription />
                          </div>
                          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "white" }}>Prescription Form</h3>
                        </div>
                        <span className="badge badge-green" style={{ fontSize: "10px" }}>Rx</span>
                      </div>

                      <div className="grid-2" style={{ gap: "10px", fontSize: "13px" }}>
                        <div>
                          <span style={{ display: "block", fontSize: "9px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>Attending Doctor</span>
                          <span style={{ color: "white", fontWeight: "600" }}>Dr. {doctor?.fullName || "Practitioner"}</span>
                        </div>
                        <div>
                          <span style={{ display: "block", fontSize: "9px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>Specialization</span>
                          <span style={{ color: "var(--text-secondary)" }}>{doctor?.specialization || "-"}</span>
                        </div>
                        <div>
                          <span style={{ display: "block", fontSize: "9px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>Appointment ID</span>
                          <span style={{ color: "var(--text-secondary)" }}>{item.appointmentId}</span>
                        </div>
                        <div>
                          <span style={{ display: "block", fontSize: "9px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>Prescribed Date</span>
                          <span style={{ color: "var(--text-secondary)" }}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</span>
                        </div>
                      </div>

                      <div style={{ background: "var(--surface-2)", borderRadius: "10px", padding: "12px", border: "1px solid var(--border)" }}>
                        <span style={{ display: "block", fontSize: "10px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700", marginBottom: "6px" }}>Medicines & Dosage</span>
                        <ul style={{ paddingLeft: "16px", color: "var(--text-primary)", fontSize: "13px", display: "flex", flexDirection: "column", gap: "4px" }}>
                          {item.medicines?.map((medicine, index) => (
                            <li key={index}>{medicine}</li>
                          ))}
                        </ul>
                      </div>

                      {item.dosageInstructions && (
                        <div>
                          <span style={{ display: "block", fontSize: "9px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700", marginBottom: "2px" }}>Instructions</span>
                          <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>{item.dosageInstructions}</p>
                        </div>
                      )}

                      {item.notes && (
                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                          <span style={{ display: "block", fontSize: "9px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700", marginBottom: "2px" }}>Notes / Reminders</span>
                          <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", fontStyle: "italic" }}>&quot;{item.notes}&quot;</p>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "10px", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "auto" }}>
                      <button
                        onClick={() => handlePrint(item.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, justifyContent: "center" }}
                      >
                        <FaPrint /> Print
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await downloadPrescriptionPdf(item.id);
                          } catch (err) {
                            setError(err.message || "Failed to download PDF");
                          }
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, justifyContent: "center" }}
                      >
                        <FaDownload /> Download PDF
                      </button>
                    </div>
                  </div>
                );
              })}

              {prescriptions.length === 0 && !error && (
                <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
                  <FaPrescription style={{ fontSize: "32px", color: "var(--text-muted)", marginBottom: "8px" }} />
                  <p style={{ color: "var(--text-secondary)" }}>No prescriptions found in your account.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
