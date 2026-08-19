"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { getPatients, deletePatient } from "@/services/adminService";
import { FaUsers, FaSearch, FaSync, FaPlus, FaEdit, FaTrash, FaTint } from "react-icons/fa";

const BLOOD_GROUPS = ["ALL", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const BLOOD_COLORS = {
  "A+": "badge-red", "A-": "badge-red",
  "B+": "badge-purple", "B-": "badge-purple",
  "AB+": "badge-cyan", "AB-": "badge-cyan",
  "O+": "badge-green", "O-": "badge-green",
};

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("ALL");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(load, 0);
    return () => window.clearTimeout(timerId);
  }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this patient?")) return;
    try {
      await deletePatient(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.fullName?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q);
      const matchBG = bloodGroupFilter === "ALL" || p.bloodGroup === bloodGroupFilter;
      return matchSearch && matchBG;
    });
  }, [patients, search, bloodGroupFilter]);

  // Blood group distribution
  const bgDistribution = useMemo(() => {
    const map = {};
    patients.forEach(p => {
      const bg = p.bloodGroup || "Unknown";
      map[bg] = (map[bg] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [patients]);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflowX: "hidden", padding: "20px 24px" }}>
          <Topbar />

          <div style={{ marginTop: 24, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Patients</h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Manage all registered patients</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={load} className="btn btn-secondary btn-sm"><FaSync style={{ fontSize: 11 }} /> Refresh</button>
              <Link href="/admin/create-patient" className="btn btn-primary btn-sm"><FaPlus style={{ fontSize: 11 }} /> Add Patient</Link>
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, color: "#fb7185", fontSize: 13 }}>
              Warning: {error}
            </div>
          )}

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
            <div className="kpi-card" style={{ "--kpi-color": "var(--blue)" }}>
              <div className="kpi-icon" style={{ background: "rgba(59,130,246,0.1)" }}><FaUsers style={{ color: "var(--blue)" }} /></div>
              <div className="kpi-value">{patients.length}</div>
              <div className="kpi-label">Total Patients</div>
            </div>
            {bgDistribution.slice(0, 3).map(([bg, count]) => (
              <div key={bg} className="kpi-card" style={{ "--kpi-color": "var(--rose)" }}>
                <div className="kpi-icon" style={{ background: "rgba(244,63,94,0.1)" }}>
                  <FaTint style={{ color: "var(--rose)" }} />
                </div>
                <div className="kpi-value">{count}</div>
                <div className="kpi-label">Blood Group {bg}</div>
              </div>
            ))}
          </div>

          {/* Blood Group Filter Chips */}
          <div className="card" style={{ marginBottom: 20, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <FaTint style={{ marginRight: 4 }} />Filter by Blood Group:
            </span>
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                onClick={() => setBloodGroupFilter(bg)}
                className={`badge ${bloodGroupFilter === bg ? "badge-red" : "badge-gray"}`}
                style={{ cursor: "pointer" }}
              >
                {bg}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div className="search-bar" style={{ flex: 1 }}>
              <FaSearch style={{ color: "var(--text-muted)", fontSize: 13 }} />
              <input
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-wrap">
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><FaUsers /></div>
                  <div className="empty-state-title">No patients found</div>
                  <div className="empty-state-sub">Try adjusting your search or filter</div>
                </div>
              ) : (
                <table className="hms-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Blood Group</th>
                      <th>DOB</th>
                      <th>Gender</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((patient, i) => (
                      <tr key={patient.userId || patient.id || i}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className={`avatar avatar-${["blue","cyan","emerald","purple","rose","amber"][i % 6]}`}>
                              {(patient.fullName || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{patient.fullName || "—"}</div>
                              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>ID: {(patient.userId || patient.id)?.slice(0, 8) || "—"}...</div>
                            </div>
                          </div>
                        </td>
                        <td>{patient.email || "—"}</td>
                        <td>{patient.phone || "—"}</td>
                        <td>
                          <span className={`badge ${BLOOD_COLORS[patient.bloodGroup] || "badge-gray"}`}>
                            <FaTint style={{ fontSize: 9, marginRight: 4 }} />
                            {patient.bloodGroup || "—"}
                          </span>
                        </td>
                        <td>{patient.dateOfBirth || "—"}</td>
                        <td>
                          <span className="badge badge-gray">{patient.gender || "—"}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Link href={`/admin/edit-patient/${patient.userId || patient.id}`} className="btn btn-secondary btn-sm">
                              <FaEdit style={{ fontSize: 11 }} />
                            </Link>
                            <button
                              onClick={() => handleDelete(patient.userId || patient.id)}
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
            Showing {filtered.length} of {patients.length} patients
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

