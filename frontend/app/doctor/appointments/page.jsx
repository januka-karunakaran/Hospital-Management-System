"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { getUser } from "@/utils/auth";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
  getAllPatients,
} from "@/services/appointmentService";
import { FaCalendarCheck, FaSync, FaSearch, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

const STATUS_BADGE = {
  PENDING: "badge-yellow",
  APPROVED: "badge-blue",
  COMPLETED: "badge-green",
  CANCELLED: "badge-red",
  REJECTED: "badge-red",
};

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  const user = typeof window !== "undefined" ? getUser() : null;

  const loadData = useCallback(async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      setError("");
      const [apptData, patientData] = await Promise.all([
        getDoctorAppointments(user.userId),
        getAllPatients(),
      ]);
      setAppointments(apptData);
      setPatients(patientData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    const timerId = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(timerId);
  }, [loadData]);

  const patientMap = useMemo(() => {
    const map = {};
    patients.forEach((p) => { map[p.userId] = p; });
    return map;
  }, [patients]);

  const handleStatusChange = async (id, status) => {
    try {
      setUpdatingId(id);
      await updateAppointmentStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const patient = patientMap[a.patientId];
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        patient?.fullName?.toLowerCase().includes(q) ||
        a.reason?.toLowerCase().includes(q) ||
        a.appointmentDate?.includes(q);
      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [appointments, search, statusFilter, patientMap]);

  const dailyCounts = useMemo(() => {
    const counts = {};
    appointments
      .filter((appointment) => !["CANCELLED", "REJECTED"].includes(appointment.status))
      .forEach((appointment) => {
        counts[appointment.appointmentDate] = (counts[appointment.appointmentDate] || 0) + 1;
      });
    return counts;
  }, [appointments]);

  return (
    <ProtectedRoute allowedRoles={["DOCTOR"]}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflowX: "hidden", padding: "20px 24px" }}>
          <Topbar />

          <div style={{ marginTop: 24, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>My Appointments</h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Review and manage your patient appointments</p>
            </div>
            <button onClick={loadData} className="btn btn-secondary btn-sm"><FaSync style={{ fontSize: 11 }} /> Refresh</button>
          </div>

          {error && <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, color: "#fb7185", fontSize: 13 }}>Warning: {error}</div>}

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
            <div className="kpi-card" style={{ "--kpi-color": "var(--blue)" }}>
              <div className="kpi-value">{appointments.length}</div>
              <div className="kpi-label">Total</div>
            </div>
            <div className="kpi-card" style={{ "--kpi-color": "var(--amber)" }}>
              <div className="kpi-value">{appointments.filter(a => a.status === "PENDING").length}</div>
              <div className="kpi-label">Pending</div>
            </div>
            <div className="kpi-card" style={{ "--kpi-color": "var(--emerald)" }}>
              <div className="kpi-value">{appointments.filter(a => a.status === "COMPLETED").length}</div>
              <div className="kpi-label">Completed</div>
            </div>
            <div className="kpi-card" style={{ "--kpi-color": "var(--rose)" }}>
              <div className="kpi-value">{appointments.filter(a => a.status === "REJECTED").length}</div>
              <div className="kpi-label">Rejected</div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
              <FaSearch style={{ color: "var(--text-muted)", fontSize: 13 }} />
              <input placeholder="Search by patient name, reason..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {["ALL", "PENDING", "APPROVED", "COMPLETED", "REJECTED"].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-secondary"}`}
              >{s}</button>
            ))}
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-wrap">
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><FaCalendarCheck /></div>
                  <div className="empty-state-title">No appointments found</div>
                </div>
              ) : (
                <table className="hms-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Token</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => {
                      const patient = patientMap[a.patientId];
                      return (
                        <tr key={a.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div className="avatar avatar-blue" style={{ width: 30, height: 30, fontSize: 11 }}>
                                {(patient?.fullName || "?")[0]}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{patient?.fullName || "Unknown"}</div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{patient?.phone || ""}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="badge badge-blue" style={{ fontSize: 12 }}>{a.tokenNumber ? `#${a.tokenNumber}` : "—"}</span></td>
                          <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                            <div>{a.appointmentDate || "—"}</div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{dailyCounts[a.appointmentDate] || 0} patients booked</div>
                          </td>
                          <td>{a.appointmentTime || "—"}</td>
                          <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.reason || "—"}</td>
                          <td><span className={`badge ${STATUS_BADGE[a.status] || "badge-gray"}`}>{a.status}</span></td>
                          <td>
                            <div style={{ display: "flex", gap: 5 }}>
                              {a.status === "PENDING" && (
                                <>
                                  <button
                                    disabled={updatingId === a.id}
                                    onClick={() => handleStatusChange(a.id, "APPROVED")}
                                    className="btn btn-success btn-sm"
                                  ><FaCheckCircle style={{ fontSize: 11 }} /> Accept</button>
                                  <button
                                    disabled={updatingId === a.id}
                                    onClick={() => handleStatusChange(a.id, "REJECTED")}
                                    className="btn btn-danger btn-sm"
                                  ><FaTimesCircle style={{ fontSize: 11 }} /> Reject</button>
                                </>
                              )}
                              {a.status === "APPROVED" && (
                                <button
                                  disabled={updatingId === a.id}
                                  onClick={() => handleStatusChange(a.id, "COMPLETED")}
                                  className="btn btn-secondary btn-sm"
                                ><FaClock style={{ fontSize: 11 }} /> Complete</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

