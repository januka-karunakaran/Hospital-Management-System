"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import {
  getAppointments,
  getDoctors,
  getPatients,
  getPrescriptions,
  getBeds,
} from "@/services/adminService";
import { getDiseaseTrends } from "@/services/dashboardService";
import {
  DiseaseTrendChart,
  BedOccupancyChart,
} from "@/components/Charts";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import * as XLSX from "xlsx";
import { FaFileExcel, FaCalendarAlt, FaUserMd, FaUsers, FaPrescriptionBottleAlt, FaBed, FaSync } from "react-icons/fa";

const CustomTooltipStyle = {
  backgroundColor: "#1a2236",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "#f1f5f9",
  fontSize: 13,
  padding: "10px 14px",
};

const BAR_COLORS = ["#3b82f6", "#10b981", "#8b5cf6"];

export default function ReportsPage() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [beds, setBeds] = useState([]);
  const [diseaseTrends, setDiseaseTrends] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [apptData, drData, ptData, rxData, bedData, diseaseData] = await Promise.all([
        getAppointments(),
        getDoctors(),
        getPatients(),
        getPrescriptions(),
        getBeds(),
        getDiseaseTrends(),
      ]);
      setAppointments(apptData);
      setDoctors(drData);
      setPatients(ptData);
      setPrescriptions(rxData);
      setBeds(bedData);
      setDiseaseTrends(diseaseData);
    } catch (err) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (!fromDate && !toDate) return true;
      const value = new Date(a.appointmentDate);
      if (fromDate && value < new Date(fromDate)) return false;
      if (toDate && value > new Date(toDate)) return false;
      return true;
    });
  }, [appointments, fromDate, toDate]);

  const report = useMemo(() => {
    const pending = filteredAppointments.filter(a => a.status === "PENDING").length;
    const approved = filteredAppointments.filter(a => a.status === "APPROVED").length;
    const rejected = filteredAppointments.filter(a => a.status === "REJECTED").length;
    const completed = filteredAppointments.filter(a => a.status === "COMPLETED").length;
    const activeDoctors = doctors.filter(d => d.status === "ACTIVE").length;
    const inactiveDoctors = doctors.filter(d => d.status === "INACTIVE").length;
    return {
      totalDoctors: doctors.length, totalPatients: patients.length,
      totalAppointments: filteredAppointments.length, totalPrescriptions: prescriptions.length,
      pending, approved, rejected, completed, activeDoctors, inactiveDoctors,
    };
  }, [filteredAppointments, doctors, patients, prescriptions]);

  const monthlyChartData = useMemo(() => {
    const monthMap = {};
    filteredAppointments.forEach((item) => {
      if (!item.appointmentDate) return;
      const date = new Date(item.appointmentDate);
      if (Number.isNaN(date.getTime())) return;
      const monthKey = date.toLocaleString("en-US", { month: "short", year: "2-digit" });
      if (!monthMap[monthKey]) monthMap[monthKey] = { month: monthKey, appointments: 0, approved: 0, completed: 0 };
      monthMap[monthKey].appointments += 1;
      if (item.status === "APPROVED") monthMap[monthKey].approved += 1;
      if (item.status === "COMPLETED") monthMap[monthKey].completed += 1;
    });
    return Object.values(monthMap);
  }, [filteredAppointments]);

  const handleExportExcel = () => {
    const summarySheet = XLSX.utils.json_to_sheet([{
      totalDoctors: report.totalDoctors, activeDoctors: report.activeDoctors,
      inactiveDoctors: report.inactiveDoctors, totalPatients: report.totalPatients,
      totalAppointments: report.totalAppointments, pendingAppointments: report.pending,
      approvedAppointments: report.approved, rejectedAppointments: report.rejected,
      completedAppointments: report.completed, totalPrescriptions: report.totalPrescriptions,
      fromDate: fromDate || "All", toDate: toDate || "All",
    }]);
    const appointmentsSheet = XLSX.utils.json_to_sheet(
      filteredAppointments.map((item) => ({
        appointmentId: item.id, doctorId: item.doctorId, patientId: item.patientId,
        appointmentDate: item.appointmentDate, appointmentTime: item.appointmentTime,
        reason: item.reason, status: item.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, appointmentsSheet, "Appointments");
    XLSX.writeFile(workbook, "hospital_reports.xlsx");
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflowX: "hidden", padding: "20px 24px" }}>
          <Topbar />

          <div style={{ marginTop: 24, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Reports & Analytics</h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Filter, analyze, and export hospital data</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="hms-input" style={{ width: 150 }} />
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="hms-input" style={{ width: 150 }} />
              <button onClick={() => { setFromDate(""); setToDate(""); }} className="btn btn-secondary btn-sm">Reset</button>
              <button onClick={load} className="btn btn-secondary btn-sm"><FaSync style={{ fontSize: 11 }} /></button>
              <button onClick={handleExportExcel} className="btn btn-primary btn-sm">
                <FaFileExcel style={{ fontSize: 11 }} /> Export Excel
              </button>
            </div>
          </div>

          {error && <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, color: "#fb7185", fontSize: 13 }}>âš  {error}</div>}

          {/* Summary KPIs */}
          <div className="grid-4" style={{ marginBottom: 16 }}>
            <div className="kpi-card" style={{ "--kpi-color": "var(--blue)" }}>
              <div className="kpi-icon" style={{ background: "rgba(59,130,246,0.1)" }}><FaUserMd style={{ color: "var(--blue)" }} /></div>
              <div className="kpi-value">{report.totalDoctors}</div>
              <div className="kpi-label">Total Doctors</div>
              <div className="kpi-sub">{report.activeDoctors} active Â· {report.inactiveDoctors} inactive</div>
            </div>
            <div className="kpi-card" style={{ "--kpi-color": "var(--purple)" }}>
              <div className="kpi-icon" style={{ background: "rgba(139,92,246,0.1)" }}><FaUsers style={{ color: "var(--purple)" }} /></div>
              <div className="kpi-value">{report.totalPatients}</div>
              <div className="kpi-label">Total Patients</div>
            </div>
            <div className="kpi-card" style={{ "--kpi-color": "var(--cyan)" }}>
              <div className="kpi-icon" style={{ background: "rgba(6,182,212,0.1)" }}><FaCalendarAlt style={{ color: "var(--cyan)" }} /></div>
              <div className="kpi-value">{report.totalAppointments}</div>
              <div className="kpi-label">Appointments</div>
              <div className="kpi-sub">{report.completed} completed Â· {report.pending} pending</div>
            </div>
            <div className="kpi-card" style={{ "--kpi-color": "var(--emerald)" }}>
              <div className="kpi-icon" style={{ background: "rgba(16,185,129,0.1)" }}><FaPrescriptionBottleAlt style={{ color: "var(--emerald)" }} /></div>
              <div className="kpi-value">{report.totalPrescriptions}</div>
              <div className="kpi-label">Prescriptions</div>
            </div>
          </div>

          {/* Appointment status breakdown */}
          <div className="grid-4" style={{ marginBottom: 16 }}>
            {[
              { label: "Pending", value: report.pending, color: "var(--amber)", cls: "badge-yellow" },
              { label: "Approved", value: report.approved, color: "var(--blue)", cls: "badge-blue" },
              { label: "Completed", value: report.completed, color: "var(--emerald)", cls: "badge-green" },
              { label: "Rejected", value: report.rejected, color: "var(--rose)", cls: "badge-red" },
            ].map(({ label, value, color, cls }) => (
              <div key={label} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>{value}</div>
                </div>
                <span className={`badge ${cls}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Monthly Appointment Chart */}
          <div className="chart-card" style={{ marginBottom: 16 }}>
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Monthly Appointment Trends</div>
                <div className="chart-card-sub">Appointments, approvals and completions by month</div>
              </div>
              <span className="badge badge-blue">{filteredAppointments.length} total</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CustomTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
                <Bar dataKey="appointments" name="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Disease + Bed Charts */}
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <DiseaseTrendChart data={diseaseTrends} />
            <BedOccupancyChart beds={beds} />
          </div>

          {/* Beds Summary */}
          {beds.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="section-title"><FaBed style={{ color: "var(--amber)" }} /> Bed Status Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {[
                  { label: "Available", count: beds.filter(b => b.status === "AVAILABLE").length, color: "var(--emerald)", cls: "badge-green" },
                  { label: "Occupied", count: beds.filter(b => b.status === "OCCUPIED").length, color: "var(--rose)", cls: "badge-red" },
                  { label: "Maintenance", count: beds.filter(b => b.status === "MAINTENANCE").length, color: "var(--amber)", cls: "badge-yellow" },
                ].map(({ label, count, color, cls }) => (
                  <div key={label} style={{ padding: "14px 16px", background: "var(--bg-2)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
                    <span className={`badge ${cls}`}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

