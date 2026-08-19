"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  getPatients,
  getAppointments,
} from "@/services/adminService";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FaMoneyBillWave, FaPlus, FaSync, FaCheckCircle, FaClock, FaTimes } from "react-icons/fa";

const PIE_COLORS = { PAID: "#10b981", PENDING: "#f59e0b", CANCELLED: "#f43f5e" };

const CustomTooltipStyle = {
  backgroundColor: "#1a2236",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "#f1f5f9",
  fontSize: 13,
  padding: "10px 14px",
};

const STATUS_BADGE = {
  PAID: "badge-green",
  PENDING: "badge-yellow",
  CANCELLED: "badge-red",
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    patientId: "",
    appointmentId: "",
    consultationFee: "",
    medicineFee: "",
    labFee: "",
    otherFee: "",
    paymentStatus: "PENDING",
    paymentMethod: "CASH",
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [invData, patData, apptData] = await Promise.all([
        getInvoices(),
        getPatients(),
        getAppointments(),
      ]);
      setInvoices(invData);
      setPatients(patData);
      setAppointments(apptData);
    } catch (err) {
      setError(err.message || "Failed to load billing data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(load, 0);
    return () => window.clearTimeout(timerId);
  }, [load]);

  const totalAmount = useMemo(() => {
    return (
      Number(form.consultationFee || 0) +
      Number(form.medicineFee || 0) +
      Number(form.labFee || 0) +
      Number(form.otherFee || 0)
    );
  }, [form]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId) { setError("Please select a patient"); return; }
    if (totalAmount <= 0) { setError("Total amount must be greater than 0"); return; }

    try {
      setSubmitting(true);
      setError("");
      const payload = {
        ...form,
        consultationFee: Number(form.consultationFee || 0),
        medicineFee: Number(form.medicineFee || 0),
        labFee: Number(form.labFee || 0),
        otherFee: Number(form.otherFee || 0),
        totalAmount,
      };
      await createInvoice(payload);
      setSuccess("Invoice created successfully!");
      setShowForm(false);
      setForm({ patientId: "", appointmentId: "", consultationFee: "", medicineFee: "", labFee: "", otherFee: "", paymentStatus: "PENDING", paymentMethod: "CASH" });
      load();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await updateInvoice(id, { paymentStatus: "PAID" });
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, paymentStatus: "PAID" } : inv));
    } catch (err) {
      setError(err.message || "Failed to update invoice");
    }
  };

  // Revenue stats
  const revenueStats = useMemo(() => {
    const paid = invoices.filter(i => i.paymentStatus === "PAID").reduce((s, i) => s + (i.totalAmount || 0), 0);
    const pending = invoices.filter(i => i.paymentStatus === "PENDING").reduce((s, i) => s + (i.totalAmount || 0), 0);
    const paidCount = invoices.filter(i => i.paymentStatus === "PAID").length;
    const pendingCount = invoices.filter(i => i.paymentStatus === "PENDING").length;
    const total = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
    return { paid, pending, total, paidCount, pendingCount };
  }, [invoices]);

  const pieData = [
    { name: "Paid", value: revenueStats.paid, color: PIE_COLORS.PAID },
    { name: "Pending", value: revenueStats.pending, color: PIE_COLORS.PENDING },
  ].filter(d => d.value > 0);

  const getPatientName = (id) => patients.find(p => (p.userId || p.id) === id)?.fullName || id?.slice(0, 8) + "..." || "—";

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflowX: "hidden", padding: "20px 24px" }}>
          <Topbar />

          <div style={{ marginTop: 24, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Billing & Invoices</h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Manage patient invoices and payments</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={load} className="btn btn-secondary btn-sm"><FaSync style={{ fontSize: 11 }} /> Refresh</button>
              <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
                <FaPlus style={{ fontSize: 11 }} /> New Invoice
              </button>
            </div>
          </div>

          {error && <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, color: "#fb7185", fontSize: 13 }}>Warning: {error}</div>}
          {success && <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, color: "#34d399", fontSize: 13 }}>Success: {success}</div>}

          {/* KPIs + Pie */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 280px", gap: 14, marginBottom: 20 }}>
            <div className="kpi-card" style={{ "--kpi-color": "var(--blue)" }}>
              <div className="kpi-icon" style={{ background: "rgba(59,130,246,0.1)" }}><FaMoneyBillWave style={{ color: "var(--blue)" }} /></div>
              <div className="kpi-value">LKR {revenueStats.total.toLocaleString("en-LK")}</div>
              <div className="kpi-label">Total Billed</div>
              <div className="kpi-sub">{invoices.length} invoices</div>
            </div>
            <div className="kpi-card" style={{ "--kpi-color": "var(--emerald)" }}>
              <div className="kpi-icon" style={{ background: "rgba(16,185,129,0.1)" }}><FaCheckCircle style={{ color: "var(--emerald)" }} /></div>
              <div className="kpi-value">LKR {revenueStats.paid.toLocaleString("en-LK")}</div>
              <div className="kpi-label">Collected</div>
              <div className="kpi-sub">{revenueStats.paidCount} paid</div>
            </div>
            <div className="kpi-card" style={{ "--kpi-color": "var(--amber)" }}>
              <div className="kpi-icon" style={{ background: "rgba(245,158,11,0.1)" }}><FaClock style={{ color: "var(--amber)" }} /></div>
              <div className="kpi-value">LKR {revenueStats.pending.toLocaleString("en-LK")}</div>
              <div className="kpi-label">Pending</div>
              <div className="kpi-sub">{revenueStats.pendingCount} pending</div>
            </div>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ResponsiveContainer width="55%" height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle} formatter={v => [`LKR ${v.toLocaleString("en-LK")}`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Create Invoice Form */}
          {showForm && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 18 }}>Create New Invoice</div>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="hms-label">Patient *</label>
                    <select name="patientId" value={form.patientId} onChange={handleChange} className="hms-select" required>
                      <option value="">Select Patient...</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.email})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="hms-label">Appointment (Optional)</label>
                    <select name="appointmentId" value={form.appointmentId} onChange={handleChange} className="hms-select">
                      <option value="">Select Appointment...</option>
                      {appointments.filter(a => !form.patientId || a.patientId === form.patientId).map(a => (
                        <option key={a.id} value={a.id}>{a.appointmentDate} {a.appointmentTime} — {a.status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="hms-label">Consultation Fee (LKR)</label>
                    <input type="number" name="consultationFee" value={form.consultationFee} onChange={handleChange} className="hms-input" placeholder="0" min="0" />
                  </div>
                  <div>
                    <label className="hms-label">Medicine Fee (LKR)</label>
                    <input type="number" name="medicineFee" value={form.medicineFee} onChange={handleChange} className="hms-input" placeholder="0" min="0" />
                  </div>
                  <div>
                    <label className="hms-label">Lab Fee (LKR)</label>
                    <input type="number" name="labFee" value={form.labFee} onChange={handleChange} className="hms-input" placeholder="0" min="0" />
                  </div>
                  <div>
                    <label className="hms-label">Other Fee (LKR)</label>
                    <input type="number" name="otherFee" value={form.otherFee} onChange={handleChange} className="hms-input" placeholder="0" min="0" />
                  </div>
                  <div>
                    <label className="hms-label">Payment Status</label>
                    <select name="paymentStatus" value={form.paymentStatus} onChange={handleChange} className="hms-select">
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                    </select>
                  </div>
                  <div>
                    <label className="hms-label">Payment Method</label>
                    <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="hms-select">
                      <option value="CASH">CASH</option>
                      <option value="CARD">CARD</option>
                      <option value="ONLINE">ONLINE</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                </div>

                {/* Total */}
                <div style={{ marginTop: 16, padding: "14px 18px", background: "var(--bg-2)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Total Amount</span>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "var(--emerald)" }}>LKR {totalAmount.toLocaleString("en-LK")}</span>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? "Creating..." : "Generate Invoice"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Invoices Table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>Invoice History</span>
              <span className="badge badge-blue">{invoices.length} Total</span>
            </div>
            <div className="table-wrap">
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
              ) : invoices.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><FaMoneyBillWave /></div>
                  <div className="empty-state-title">No invoices yet</div>
                  <div className="empty-state-sub">Create your first invoice using the button above</div>
                </div>
              ) : (
                <table className="hms-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Consult</th>
                      <th>Medicine</th>
                      <th>Lab</th>
                      <th>Other</th>
                      <th>Total</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{getPatientName(inv.patientId)}</div>
                        </td>
                        <td>LKR {(inv.consultationFee || 0).toLocaleString("en-LK")}</td>
                        <td>LKR {(inv.medicineFee || 0).toLocaleString("en-LK")}</td>
                        <td>LKR {(inv.labFee || 0).toLocaleString("en-LK")}</td>
                        <td>LKR {(inv.otherFee || 0).toLocaleString("en-LK")}</td>
                        <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>LKR {(inv.totalAmount || 0).toLocaleString("en-LK")}</td>
                        <td><span className="badge badge-gray">{inv.paymentMethod || "—"}</span></td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[inv.paymentStatus] || "badge-gray"}`}>
                            {inv.paymentStatus || "—"}
                          </span>
                        </td>
                        <td>
                          {inv.paymentStatus !== "PAID" && (
                            <button
                              onClick={() => handleMarkPaid(inv.id)}
                              className="btn btn-success btn-sm"
                            >
                              <FaCheckCircle style={{ fontSize: 11 }} /> Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
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

