"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { getUser } from "@/utils/auth";
import {
  getPatientAppointments,
  getAllDoctors,
} from "@/services/appointmentService";
import { FaCalendarAlt, FaSearch, FaSync, FaUserMd, FaPlus } from "react-icons/fa";

const STATUS_BADGE = {
  PENDING: "badge-yellow",
  APPROVED: "badge-blue",
  COMPLETED: "badge-green",
  CANCELLED: "badge-red",
  REJECTED: "badge-red",
};

export default function PatientMyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const user = typeof window !== "undefined" ? getUser() : null;

  const loadData = useCallback(async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      setError("");
      const [appointmentData, doctorData] = await Promise.all([
        getPatientAppointments(user.userId),
        getAllDoctors(),
      ]);
      setAppointments(appointmentData);
      setDoctors(doctorData);
    } catch (err) {
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    const timerId = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(timerId);
  }, [loadData]);

  const doctorMap = useMemo(() => {
    const map = {};
    doctors.forEach((d) => { map[d.id] = d; });
    return map;
  }, [doctors]);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const doctor = doctorMap[a.doctorId];
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        doctor?.fullName?.toLowerCase().includes(q) ||
        doctor?.specialization?.toLowerCase().includes(q) ||
        a.reason?.toLowerCase().includes(q) ||
        a.appointmentDate?.includes(q);
      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [appointments, search, statusFilter, doctorMap]);

  return (
    <ProtectedRoute allowedRoles={["PATIENT"]}>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Topbar />

          <div className="page-content">
            {/* Header */}
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1>My Appointments</h1>
                <p>Track and manage your scheduled consultations</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={loadData} className="btn btn-secondary btn-sm">
                  <FaSync /> Refresh
                </button>
                <Link href="/patient/appointments" className="btn btn-primary btn-sm">
                  <FaPlus /> Book New
                </Link>
              </div>
            </div>

            {error && (
              <div className="badge-red" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", textTransform: "none" }}>
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* KPIs */}
            <div className="grid-4" style={{ marginBottom: "8px" }}>
              <div className="kpi-card" style={{ "--kpi-color": "var(--blue)" }}>
                <div className="kpi-value">{appointments.length}</div>
                <div className="kpi-label">Total</div>
              </div>
              <div className="kpi-card" style={{ "--kpi-color": "var(--amber)" }}>
                <div className="kpi-value">{appointments.filter(a => a.status === "PENDING" || a.status === "APPROVED").length}</div>
                <div className="kpi-label">Upcoming</div>
              </div>
              <div className="kpi-card" style={{ "--kpi-color": "var(--emerald)" }}>
                <div className="kpi-value">{appointments.filter(a => a.status === "COMPLETED").length}</div>
                <div className="kpi-label">Completed</div>
              </div>
              <div className="kpi-card" style={{ "--kpi-color": "var(--rose)" }}>
                <div className="kpi-value">{appointments.filter(a => a.status === "CANCELLED" || a.status === "REJECTED").length}</div>
                <div className="kpi-label">Cancelled</div>
              </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                <div className="search-bar" style={{ minWidth: "260px", flex: 1 }}>
                  <FaSearch style={{ color: "var(--text-muted)" }} />
                  <input
                    placeholder="Search by doctor, specialization, reason..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["ALL", "PENDING", "APPROVED", "COMPLETED", "REJECTED"].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-secondary"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Appointments Grid */}
            {loading ? (
              <div className="grid-2">
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 14 }} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon"><FaCalendarAlt /></div>
                  <div className="empty-state-title">No appointments found</div>
                  <div className="empty-state-sub">
                    {appointments.length === 0 ? "You haven't booked any appointments yet." : "Try adjusting your search or filter."}
                  </div>
                  {appointments.length === 0 && (
                    <Link href="/patient/appointments" className="btn btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
                      Book Your First Appointment
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid-2">
                {filtered.map((item) => {
                  const doctor = doctorMap[item.doctorId];
                  return (
                    <div key={item.id} className="card fade-in" style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: "12px", borderTop: `3px solid ${
                      item.status === "COMPLETED" ? "var(--emerald)"
                        : item.status === "APPROVED" ? "var(--blue)"
                        : item.status === "PENDING" ? "var(--amber)"
                        : "var(--rose)"
                    }` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div className="avatar avatar-blue">
                            {(doctor?.fullName || "D")[0]}
                          </div>
                          <div>
                            <h4 style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14.5px" }}>
                              Dr. {doctor?.fullName || "Practitioner"}
                            </h4>
                            {doctor?.specialization && (
                              <span className="badge badge-blue" style={{ marginTop: "4px" }}>{doctor.specialization}</span>
                            )}
                          </div>
                        </div>
                        <span className={`badge ${STATUS_BADGE[item.status] || "badge-gray"}`}>{item.status}</span>
                      </div>

                      <div className="grid-2" style={{ background: "var(--surface-2)", borderRadius: "8px", padding: "10px", marginTop: "4px" }}>
                        <div>
                          <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px", fontWeight: "700" }}>Date</div>
                          <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{item.appointmentDate || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px", fontWeight: "700" }}>Time</div>
                          <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{item.appointmentTime || "—"}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 11px", borderRadius: 8, background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)" }}>
                        <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>Queue token</span>
                        <strong style={{ color: "var(--cyan)", fontSize: 16 }}>{item.tokenNumber ? `#${item.tokenNumber}` : "Not assigned"}</strong>
                      </div>

                      {item.reason && (
                        <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic" }}>
                          &quot;{item.reason}&quot;
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {!loading && (
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: "4px" }}>
                Showing {filtered.length} of {appointments.length} appointments
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
