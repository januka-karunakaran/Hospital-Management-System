"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { getPrescriptions } from "@/services/adminService";
import { FaPrescriptionBottleAlt, FaSync, FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getPrescriptions();
      setPrescriptions(data);
    } catch (err) {
      setError(err.message || "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return prescriptions.filter((p) =>
      !q ||
      p.doctorId?.toLowerCase().includes(q) ||
      p.patientId?.toLowerCase().includes(q) ||
      p.appointmentId?.toLowerCase().includes(q) ||
      p.diagnosis?.toLowerCase().includes(q)
    );
  }, [prescriptions, search]);

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflowX: "hidden", padding: "20px 24px" }}>
          <Topbar />

          <div style={{ marginTop: 24, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Prescriptions</h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>All prescriptions issued across the system</p>
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

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
            <div className="kpi-card" style={{ "--kpi-color": "var(--purple)" }}>
              <div className="kpi-value">{prescriptions.length}</div>
              <div className="kpi-label">Total Prescriptions</div>
            </div>
            <div className="kpi-card" style={{ "--kpi-color": "var(--blue)" }}>
              <div className="kpi-icon" style={{ background: "rgba(59,130,246,0.1)" }}>
                <FaPrescriptionBottleAlt style={{ color: "var(--blue)" }} />
              </div>
              <div className="kpi-value">{new Set(prescriptions.map(p => p.doctorId)).size}</div>
              <div className="kpi-label">Prescribing Doctors</div>
            </div>
            <div className="kpi-card" style={{ "--kpi-color": "var(--emerald)" }}>
              <div className="kpi-value">{new Set(prescriptions.map(p => p.patientId)).size}</div>
              <div className="kpi-label">Unique Patients</div>
            </div>
          </div>

          {/* Search */}
          <div className="search-bar" style={{ marginBottom: 16 }}>
            <FaSearch style={{ color: "var(--text-muted)", fontSize: 13 }} />
            <input
              placeholder="Search by doctor, patient, diagnosis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><FaPrescriptionBottleAlt /></div>
                <div className="empty-state-title">No prescriptions found</div>
              </div>
            ) : (
              <div>
                {filtered.map((presc) => {
                  const isOpen = expanded === presc.id;
                  // Parse medicines if stored as JSON string
                  let medicines = [];
                  try {
                    if (typeof presc.medicines === "string") medicines = JSON.parse(presc.medicines);
                    else if (Array.isArray(presc.medicines)) medicines = presc.medicines;
                  } catch { medicines = []; }

                  return (
                    <div key={presc.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr 120px 36px",
                          gap: 16,
                          padding: "14px 20px",
                          alignItems: "center",
                          cursor: "pointer",
                          transition: "background 0.12s",
                        }}
                        onClick={() => toggleExpand(presc.id)}
                        className="hms-table-row-hover"
                        onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        {/* Doctor */}
                        <div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>Doctor ID</div>
                          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "monospace" }}>{presc.doctorId?.slice(0, 12) || "â€”"}...</div>
                        </div>
                        {/* Patient */}
                        <div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>Patient ID</div>
                          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "monospace" }}>{presc.patientId?.slice(0, 12) || "â€”"}...</div>
                        </div>
                        {/* Diagnosis */}
                        <div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>Diagnosis</div>
                          <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{presc.diagnosis || "â€”"}</div>
                        </div>
                        {/* Med count */}
                        <div style={{ textAlign: "center" }}>
                          <span className="badge badge-purple">
                            {medicines.length || (presc.medicines ? "1" : "0")} Medicine{medicines.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div style={{ color: "var(--text-muted)" }}>
                          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isOpen && (
                        <div style={{ padding: "16px 20px 20px", background: "var(--bg-2)", borderTop: "1px solid var(--border)" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Appointment Info</div>
                              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                <div><span style={{ color: "var(--text-muted)" }}>Appointment ID:</span> <span style={{ fontFamily: "monospace" }}>{presc.appointmentId || "â€”"}</span></div>
                                <div style={{ marginTop: 4 }}><span style={{ color: "var(--text-muted)" }}>Notes:</span> {presc.notes || "No notes"}</div>
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Medicines Prescribed</div>
                              {medicines.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  {medicines.map((med, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", background: "var(--surface)", borderRadius: 8, fontSize: 13 }}>
                                      <span className="badge badge-purple" style={{ minWidth: 20, justifyContent: "center" }}>{i + 1}</span>
                                      <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{med.name || med.medicineName || JSON.stringify(med)}</span>
                                      {med.dosage && <span style={{ color: "var(--text-muted)" }}>{med.dosage}</span>}
                                      {med.duration && <span style={{ color: "var(--text-muted)" }}>{med.duration}</span>}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
                                  {typeof presc.medicines === "string" ? presc.medicines : "No medicines listed"}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
            Showing {filtered.length} of {prescriptions.length} prescriptions
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

