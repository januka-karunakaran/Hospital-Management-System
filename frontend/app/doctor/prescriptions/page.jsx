"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { getUser } from "@/utils/auth";
import { getAllPatients, getDoctorAppointments } from "@/services/appointmentService";
import { createPrescription } from "@/services/prescriptionService";
import { getPrescriptions } from "@/services/adminService";
import { FaPrescriptionBottleAlt, FaPlus, FaMinus, FaSync } from "react-icons/fa";

export default function DoctorPrescriptionsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [myPrescriptions, setMyPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    appointmentId: "",
    patientId: "",
    diagnosis: "",
    notes: "",
    medicines: [{ name: "", dosage: "", duration: "", frequency: "" }],
  });

  const user = typeof window !== "undefined" ? getUser() : null;
  const userId = user?.userId;

  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError("");
      const [apptData, patientData, rxData] = await Promise.all([
        getDoctorAppointments(userId),
        getAllPatients(),
        getPrescriptions(),
      ]);
      const eligible = apptData.filter(a => a.status === "APPROVED" || a.status === "COMPLETED");
      setAppointments(eligible);
      setPatients(patientData);
      setMyPrescriptions(rxData.filter(p => p.doctorId === userId));
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const timerId = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(timerId);
  }, [loadData]);

  const patientMap = useMemo(() => {
    const map = {};
    patients.forEach((patient) => { map[patient.userId] = patient; });
    return map;
  }, [patients]);

  const handleAppointmentChange = (e) => {
    const selectedId = e.target.value;
    const selected = appointments.find(a => a.id === selectedId);
    setForm(prev => ({ ...prev, appointmentId: selectedId, patientId: selected?.patientId || "" }));
  };

  const handleMedChange = (index, field, value) => {
    setForm(prev => {
      const meds = [...prev.medicines];
      meds[index] = { ...meds[index], [field]: value };
      return { ...prev, medicines: meds };
    });
  };

  const addMedicine = () => {
    setForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: "", dosage: "", duration: "", frequency: "" }],
    }));
  };

  const removeMedicine = (index) => {
    setForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.appointmentId) { setError("Please select an appointment"); return; }
    if (!form.medicines[0].name) { setError("Please add at least one medicine"); return; }
    try {
      setSubmitting(true);
      setError("");
      const medicines = form.medicines
        .filter((medicine) => medicine.name)
        .map((medicine) => [
          medicine.name,
          medicine.dosage && `Dosage: ${medicine.dosage}`,
          medicine.frequency && `Frequency: ${medicine.frequency}`,
          medicine.duration && `Duration: ${medicine.duration}`,
        ].filter(Boolean).join(" | "));

      await createPrescription({
        appointmentId: form.appointmentId,
        doctorId: user.userId,
        patientId: form.patientId,
        diagnosis: form.diagnosis,
        medicines,
        dosageInstructions: medicines.join("; "),
        notes: form.notes,
      });
      setSuccess("Prescription created successfully!");
      setShowForm(false);
      setForm({ appointmentId: "", patientId: "", diagnosis: "", notes: "", medicines: [{ name: "", dosage: "", duration: "", frequency: "" }] });
      loadData();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to create prescription");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["DOCTOR"]}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflowX: "hidden", padding: "20px 24px" }}>
          <Topbar />

          <div style={{ marginTop: 24, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Prescriptions</h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Create and view patient prescriptions</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={loadData} className="btn btn-secondary btn-sm"><FaSync style={{ fontSize: 11 }} /></button>
              <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
                <FaPlus style={{ fontSize: 11 }} /> New Prescription
              </button>
            </div>
          </div>

          {error && <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, color: "#fb7185", fontSize: 13 }}>Warning: {error}</div>}
          {success && <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, color: "#34d399", fontSize: 13 }}>Success: {success}</div>}

          {/* Create Form */}
          {showForm && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 18 }}>New Prescription</div>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label className="hms-label">Appointment *</label>
                    <select value={form.appointmentId} onChange={handleAppointmentChange} className="hms-select" required>
                      <option value="">Select Appointment...</option>
                      {appointments.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.appointmentDate} {a.appointmentTime} — {patientMap[a.patientId]?.fullName || "Unknown patient"} ({patientMap[a.patientId]?.email || "No email"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="hms-label">Diagnosis</label>
                    <input
                      type="text"
                      value={form.diagnosis}
                      onChange={e => setForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                      className="hms-input"
                      placeholder="e.g. Fever, Hypertension"
                    />
                  </div>
                </div>

                {/* Medicines */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label className="hms-label" style={{ margin: 0 }}>Medicines</label>
                    <button type="button" onClick={addMedicine} className="btn btn-secondary btn-sm">
                      <FaPlus style={{ fontSize: 10 }} /> Add
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {form.medicines.map((med, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 36px", gap: 8, alignItems: "center" }}>
                        <input type="text" placeholder="Medicine name" value={med.name} onChange={e => handleMedChange(i, "name", e.target.value)} className="hms-input" />
                        <input type="text" placeholder="Dosage" value={med.dosage} onChange={e => handleMedChange(i, "dosage", e.target.value)} className="hms-input" />
                        <input type="text" placeholder="Duration" value={med.duration} onChange={e => handleMedChange(i, "duration", e.target.value)} className="hms-input" />
                        <input type="text" placeholder="Frequency" value={med.frequency} onChange={e => handleMedChange(i, "frequency", e.target.value)} className="hms-input" />
                        {form.medicines.length > 1 && (
                          <button type="button" onClick={() => removeMedicine(i)} className="btn btn-danger btn-sm" style={{ padding: "8px" }}>
                            <FaMinus style={{ fontSize: 10 }} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="hms-label">Notes / Instructions</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="hms-input"
                    placeholder="Patient condition notes, special instructions..."
                    rows={3}
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? "Saving..." : "Save Prescription"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* My Prescriptions Table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>My Prescriptions</span>
              <span className="badge badge-purple">{myPrescriptions.length} Total</span>
            </div>
            <div className="table-wrap">
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
              ) : myPrescriptions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><FaPrescriptionBottleAlt /></div>
                  <div className="empty-state-title">No prescriptions yet</div>
                  <div className="empty-state-sub">Create your first prescription above</div>
                </div>
              ) : (
                <table className="hms-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Diagnosis</th>
                      <th>Medicines</th>
                      <th>Notes</th>
                      <th>Appointment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myPrescriptions.map((p) => {
                      const patient = patientMap[p.patientId];
                      let meds = [];
                      try {
                        if (typeof p.medicines === "string") meds = JSON.parse(p.medicines);
                        else if (Array.isArray(p.medicines)) meds = p.medicines;
                      } catch { meds = []; }
                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>
                              {patient?.fullName || "Unknown patient"}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                              {patient?.email || "No email available"}
                            </div>
                          </td>
                          <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{p.diagnosis || "—"}</td>
                          <td>
                            <span className="badge badge-purple">
                              {meds.length || "?"} medicine{meds.length !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.notes || "—"}
                          </td>
                          <td style={{ fontFamily: "monospace", fontSize: 12 }}>{p.appointmentId?.slice(0, 10) || "—"}...</td>
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

