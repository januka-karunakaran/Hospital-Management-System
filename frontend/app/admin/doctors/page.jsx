"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { getDoctors, deleteDoctor } from "@/services/adminService";
import { FaUserMd, FaSearch, FaSync, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const SPECIALIZATIONS = ["ALL", "Cardiology", "Dermatology", "Neurology", "Orthopedics", "Pediatrics", "General Medicine", "Gynecology", "Psychiatry", "Ophthalmology"];

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDoctors();
      setDoctors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this doctor?")) return;
    try {
      await deleteDoctor(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.fullName?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.phone?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [doctors, search, statusFilter]);

  const activeCount = doctors.filter(d => d.status === "ACTIVE").length;
  const inactiveCount = doctors.filter(d => d.status === "INACTIVE").length;

  // Group by specialization for display
  const specGroups = useMemo(() => {
    const map = {};
    doctors.forEach(d => {
      const spec = d.specialization || "Other";
      map[spec] = (map[spec] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [doctors]);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflowX: "hidden", padding: "20px 24px" }}>
          <Topbar />

          <div style={{ marginTop: 24, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Doctors</h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Manage all registered doctors</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={load} className="btn btn-secondary btn-sm"><FaSync style={{ fontSize: 11 }} /> Refresh</button>
              <Link href="/admin/create-doctor" className="btn btn-primary btn-sm"><FaPlus style={{ fontSize: 11 }} /> Add Doctor</Link>
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, color: "#fb7185", fontSize: 13 }}>
              Warning: {error}
            </div>
          )}

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
            <div className="kpi-card" style={{ "--kpi-color": "var(--blue)" }}>
              <div className="kpi-icon" style={{ background: "rgba(59,130,246,0.1)" }}><FaUserMd style={{ color: "var(--blue)" }} /></div>
              <div className="kpi-value">{doctors.length}</div>
              <div className="kpi-label">Total Doctors</div>
            </div>
            <div className="kpi-card" style={{ "--kpi-color": "var(--emerald)" }}>
              <div className="kpi-value">{activeCount}</div>
              <div className="kpi-label">Active</div>
            </div>
            <div className="kpi-card" style={{ "--kpi-color": "var(--rose)" }}>
              <div className="kpi-value">{inactiveCount}</div>
              <div className="kpi-label">Inactive</div>
            </div>
          </div>

          {/* Top specializations */}
          {specGroups.length > 0 && (
            <div className="card" style={{ marginBottom: 20, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Top Specializations:</span>
              {specGroups.map(([spec, count]) => (
                <button
                  key={spec}
                  onClick={() => setSearch(spec)}
                  className="badge badge-blue"
                  style={{ cursor: "pointer", background: "rgba(59,130,246,0.08)" }}
                >
                  {spec} <span style={{ opacity: 0.7 }}>({count})</span>
                </button>
              ))}
            </div>
          )}

          {/* Search + Filter */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div className="search-bar" style={{ flex: 1 }}>
              <FaSearch style={{ color: "var(--text-muted)", fontSize: 13 }} />
              <input
                placeholder="Search by name, email, specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className={`btn btn-sm ${statusFilter === "ALL" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setStatusFilter("ALL")}
            >All</button>
            <button
              className={`btn btn-sm ${statusFilter === "ACTIVE" ? "btn-success" : "btn-secondary"}`}
              onClick={() => setStatusFilter("ACTIVE")}
            >Active</button>
            <button
              className={`btn btn-sm ${statusFilter === "INACTIVE" ? "btn-danger" : "btn-secondary"}`}
              onClick={() => setStatusFilter("INACTIVE")}
            >Inactive</button>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-wrap">
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><FaUserMd /></div>
                  <div className="empty-state-title">No doctors found</div>
                  <div className="empty-state-sub">Try adjusting your search</div>
                </div>
              ) : (
                <table className="hms-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Email</th>
                      <th>Specialization</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((doctor, i) => (
                      <tr key={doctor.id || i}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className={`avatar avatar-${["blue","cyan","emerald","purple","rose","amber"][i % 6]}`}>
                              {(doctor.fullName || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{doctor.fullName || "—"}</div>
                              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>ID: {doctor.id?.slice(0, 8) || "—"}...</div>
                            </div>
                          </div>
                        </td>
                        <td>{doctor.email || "—"}</td>
                        <td>
                          <span className="badge badge-blue">{doctor.specialization || "—"}</span>
                        </td>
                        <td>{doctor.phone || "—"}</td>
                        <td>
                          <span className={`badge ${doctor.status === "ACTIVE" ? "badge-green" : "badge-red"}`}>
                            {doctor.status || "UNKNOWN"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Link href={`/admin/edit-doctor/${doctor.id}`} className="btn btn-secondary btn-sm">
                              <FaEdit style={{ fontSize: 11 }} />
                            </Link>
                            <button
                              onClick={() => handleDelete(doctor.id)}
                              className="btn btn-danger btn-sm"
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
            Showing {filtered.length} of {doctors.length} doctors
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

