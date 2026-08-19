"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { getAppointments, updateAppointmentStatus, deleteAppointment } from "@/services/adminService";
import { AppointmentStatusChart } from "@/components/Charts";
import { FaCalendarCheck, FaSync, FaSearch, FaTrash } from "react-icons/fa";

const STATUS_COLORS = {
  PENDING: "badge-yellow",
  APPROVED: "badge-blue",
  COMPLETED: "badge-green",
  CANCELLED: "badge-red",
  REJECTED: "badge-red",
};

const STATUSES = ["ALL", "PENDING", "APPROVED", "COMPLETED", "CANCELLED"];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await updateAppointmentStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: newStatus } : a)
      );
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete");
    }
  };

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.patientId?.toLowerCase().includes(q) ||
        a.doctorId?.toLowerCase().includes(q) ||
        a.reason?.toLowerCase().includes(q) ||
        a.appointmentDate?.includes(q);
      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [appointments, search, statusFilter]);

  // Build stats for chart from filtered
  const chartStats = useMemo(() => ({
    completedAppointments: appointments.filter(a => a.status === "COMPLETED").length,
    pendingAppointments: appointments.filter(a => a.status === "PENDING").length,
    cancelledAppointments: appointments.filter(a => a.status === "CANCELLED" || a.status === "REJECTED").length,
  }), [appointments]);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflowX: "hidden", padding: "20px 24px" }}>
          <Topbar />

          <div style={{ marginTop: 24, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Appointments</h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>View and manage all patient appointments</p>
            </div>
            <button onClick={load} className="btn btn-secondary btn-sm">
              <FaSync style={{ fontSize: 11 }} /> Refresh
            </button>
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, color: "#fb7185", fontSize: 13 }}>
              âš  {error}
            </div>
          )}

          {/* KPI + Chart */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 14, marginBottom: 20 }}>
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
              <div className="kpi-value">{appointments.filter(a => a.status === "CANCELLED" || a.status === "REJECTED").length}</div>
              <div className="kpi-label">Cancelled</div>
            </div>
          </div>

          {/* Status Pie */}
          <div style={{ marginBottom: 20 }}>
            <AppointmentStatusChart stats={chartStats} />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
              <FaSearch style={{ color: "var(--text-muted)", fontSize: 13 }} />
              <input
                placeholder="Search by patient, doctor, reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {STATUSES.map((s) => (
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

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-wrap">
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><FaCalendarCheck /></div>
                  <div className="empty-state-title">No appointments found</div>
                  <div className="empty-state-sub">Try adjusting your filters</div>
                </div>
              ) : (
                <table className="hms-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Patient ID</th>
                      <th>Doctor ID</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((appt) => (
                      <tr key={appt.id}>
                        <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                          {appt.appointmentDate || "â€”"}
                        </td>
                        <td>{appt.appointmentTime || "â€”"}</td>
                        <td style={{ fontFamily: "monospace", fontSize: 12 }}>{appt.patientId?.slice(0, 8) || "â€”"}...</td>
                        <td style={{ fontFamily: "monospace", fontSize: 12 }}>{appt.doctorId?.slice(0, 8) || "â€”"}...</td>
                        <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {appt.reason || "â€”"}
                        </td>
                        <td>
                          <span className={`badge ${STATUS_COLORS[appt.status] || "badge-gray"}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <select
                              value={appt.status}
                              disabled={updatingId === appt.id}
                              onChange={(e) => handleStatusUpdate(appt.id, e.target.value)}
                              className="hms-select"
                              style={{ width: 130, padding: "5px 8px", fontSize: 12 }}
                            >
                              {["PENDING", "APPROVED", "COMPLETED", "CANCELLED"].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleDelete(appt.id)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: "5px 8px" }}
                            >
                              <FaTrash style={{ fontSize: 11 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
            Showing {filtered.length} of {appointments.length} appointments
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

