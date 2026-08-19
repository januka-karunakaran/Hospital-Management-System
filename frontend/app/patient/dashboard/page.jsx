"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import DashboardCard from "@/app/components/DashboardCard";
import SilentLogin from "@/app/components/SilentLogin";
import { 
  getPatientDashboardSummary, 
  getAppointmentHistory 
} from "@/services/patientDashboardService";
import { getUser } from "@/utils/auth";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { FaCalendarAlt, FaPrescription, FaUserMd, FaClock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function PatientDashboard() {
  const router = useRouter();
  const user = getUser();
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryData, historyData] = await Promise.all([
          getPatientDashboardSummary(),
          getAppointmentHistory(7)
        ]);
        setSummary(summaryData);
        setHistory(historyData);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0a0e1a] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const statusData = [
    { name: "Completed", value: summary?.healthStats?.completedAppointments || 0 },
    { name: "Upcoming", value: summary?.healthStats?.upcomingAppointments || 0 },
    { name: "Cancelled", value: summary?.healthStats?.cancelledAppointments || 0 },
  ];

  return (
    <ProtectedRoute allowedRoles={["PATIENT"]}>
      <SilentLogin />
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Topbar />

          <div className="page-content">
            {/* Header */}
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1>Welcome back, {user?.fullName || "Patient"}</h1>
                <p>Track your health journey, prescriptions, and consult bookings</p>
              </div>
              <button 
                onClick={() => router.push("/patient/appointments")}
                className="btn btn-primary"
              >
                <FaCalendarAlt /> Book Appointment
              </button>
            </div>

            {error && (
              <div className="badge-red fade-in" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", textTransform: "none" }}>
                <FaExclamationCircle style={{ fontSize: "16px" }} />
                <span>{error}</span>
              </div>
            )}

            {/* KPIs */}
            <div className="grid-4">
              <DashboardCard 
                title="Appointments" 
                value={summary?.healthStats?.totalAppointments || 0} 
                subtitle="Total visits"
                color="var(--blue)"
              />
              <DashboardCard 
                title="Prescriptions" 
                value={summary?.healthStats?.totalPrescriptions || 0} 
                subtitle={`${summary?.healthStats?.activePrescriptions || 0} active`}
                color="var(--emerald)"
              />
              <DashboardCard 
                title="Completion" 
                value={`${summary?.healthStats?.appointmentCompletionRate?.toFixed(0) || 0}%`} 
                subtitle="Attendance rate"
                color="var(--purple)"
              />
              <DashboardCard 
                title="Upcoming" 
                value={summary?.healthStats?.upcomingAppointments || 0} 
                subtitle="Next scheduled"
                color="var(--amber)"
              />
            </div>

            {/* Next Appointment Section */}
            <div className="grid-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              
              {/* Highlight Card */}
              <div className="card fade-in" style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "20px", borderLeft: "4px solid var(--blue)", background: "var(--surface)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ fontSize: "18px", fontWeight: "800", color: "white" }}>Next Appointment</h2>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Don't forget your upcoming checkup!</p>
                  </div>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifySpace: "center", justifyContent: "center", color: "var(--blue)" }}>
                    <FaCalendarAlt />
                  </div>
                </div>

                {summary?.upcomingAppointments?.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", background: "var(--surface-2)", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ height: "46px", width: "46px", borderRadius: "10px", background: "linear-gradient(135deg, var(--blue), var(--cyan))", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700" }}>
                        Dr
                      </div>
                      <div>
                        <h4 style={{ fontSize: "15px", fontWeight: "700", color: "white" }}>{summary.upcomingAppointments[0].doctorName}</h4>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{summary.upcomingAppointments[0].doctorSpecialization}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "24px" }}>
                      <div>
                        <span style={{ display: "block", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "2px" }}>Date</span>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "white" }}>{summary.upcomingAppointments[0].appointmentDate}</span>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "2px" }}>Time</span>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "white" }}>{summary.upcomingAppointments[0].appointmentTime}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push("/patient/my-appointments")}
                      className="btn btn-primary btn-sm"
                    >
                      View Details
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "16px", background: "var(--surface-2)", borderRadius: "12px" }}>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No upcoming appointments scheduled.</p>
                    <button 
                      onClick={() => router.push("/patient/appointments")}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: "12px" }}
                    >
                      Book Now
                    </button>
                  </div>
                )}
              </div>

              {/* Status Pie Chart */}
              <div className="card fade-in" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Visit Status</h3>
                <div style={{ width: "100%", height: 130, position: "relative" }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={56}
                        innerRadius={40}
                        paddingAngle={4}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "6px", fontSize: "11px", color: "var(--text-muted)" }}>
                  {statusData.map((entry, index) => (
                    <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <div style={{ h: "8px", w: "8px", height: "8px", width: "8px", borderRadius: "50%", backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span>{entry.name}: <strong>{entry.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Lower Grid (Prescriptions & Trends) */}
            <div className="grid-2">
              
              {/* Prescriptions */}
              <div className="card fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Recent Prescriptions</h3>
                  <button 
                    onClick={() => router.push("/patient/my-prescriptions")}
                    style={{ background: "none", border: "none", color: "var(--cyan)", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}
                  >
                    View All
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {summary?.activePrescriptions?.slice(0, 2).map((presc) => (
                    <div 
                      key={presc.prescriptionId} 
                      onClick={() => router.push("/patient/my-prescriptions")}
                      style={{ display: "flex", gap: "12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "12px", cursor: "pointer", transition: "all 0.12s" }}
                      className="hover-card"
                    >
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(16,185,129,0.1)", color: "var(--emerald)", display: "flex", alignItems: "center", justifySpace: "center", justifyContent: "center", fontSize: "16px" }}>
                        <FaPrescription />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <h4 style={{ fontSize: "13.5px", fontWeight: "700", color: "white" }}>{presc.doctorName}</h4>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{presc.medicineCount} Medicines</span>
                        </div>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{presc.doctorSpecialization}</p>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          "{presc.medicines}"
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!summary?.activePrescriptions || summary.activePrescriptions.length === 0) && (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: "13px" }}>
                      No active prescriptions found.
                    </div>
                  )}
                </div>
              </div>

              {/* Trends */}
              <div className="card fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Visit Trends</h3>
                <div style={{ width: "100%", height: 180 }}>
                  <ResponsiveContainer>
                    <AreaChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
                      <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)" }} />
                      <Area type="monotone" dataKey="appointmentCount" stroke="var(--emerald)" strokeWidth={2} fill="var(--emerald)" fillOpacity={0.08} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
