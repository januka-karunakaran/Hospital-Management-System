"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import DashboardCard from "@/app/components/DashboardCard";
import SilentLogin from "@/app/components/SilentLogin";
import { 
  getDoctorPerformance, 
  getDoctorAppointmentStats, 
  getAppointmentTrends 
} from "@/services/dashboardService";
import { getUser } from "@/utils/auth";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { FaCalendarAlt, FaPrescription, FaUser, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function DoctorDashboard() {
  const router = useRouter();
  const user = getUser();
  const [performance, setPerformance] = useState(null);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!user?.userId) return;
      try {
        const [perfData, statsData, trendsData] = await Promise.all([
          getDoctorPerformance(user.userId),
          getDoctorAppointmentStats(user.userId),
          getAppointmentTrends(7)
        ]);

        setPerformance(perfData);
        setStats(statsData);
        setTrends(trendsData);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.userId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0a0e1a] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const statusData = [
    { name: "Completed", value: stats?.completedAppointments || 0 },
    { name: "Pending", value: stats?.pendingAppointments || 0 },
    { name: "Cancelled", value: stats?.cancelledAppointments || 0 },
  ];

  return (
    <ProtectedRoute allowedRoles={["DOCTOR"]}>
      <SilentLogin />
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Topbar />

          <div className="page-content">
            {/* Header */}
            <div className="page-header">
              <h1>Welcome, Dr. {user?.fullName || "Practitioner"}</h1>
              <p>Here's your clinical practice summary and schedules for today</p>
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
                title="Total Appointments" 
                value={stats?.totalAppointments || 0} 
                subtitle="All time"
                color="var(--blue)"
              />
              <DashboardCard 
                title="Completion Rate" 
                value={`${stats?.completionRate?.toFixed(1) || 0}%`} 
                subtitle="Performance"
                color="var(--emerald)"
              />
              <DashboardCard 
                title="Patient Rating" 
                value={performance?.avgRating?.toFixed(1) || "4.8"} 
                subtitle="Avg. from patients"
                color="var(--purple)"
              />
              <DashboardCard 
                title="Upcoming" 
                value={stats?.pendingAppointments || 0} 
                subtitle="Pending schedules"
                color="var(--amber)"
              />
            </div>

            {/* Charts Section */}
            <div className="grid-3" style={{ gridTemplateColumns: "2fr 1fr" }}>
              
              {/* Appointment Trends */}
              <div className="card fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Appointment Trends</h3>
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <AreaChart data={trends}>
                      <defs>
                        <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="var(--purple)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
                      <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)" }} />
                      <Area type="monotone" dataKey="appointmentCount" stroke="var(--purple)" strokeWidth={2} fillOpacity={1} fill="url(#colorAppt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="card fade-in" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Appointment Status</h3>
                <div style={{ width: "100%", height: 180, position: "relative" }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={70}
                        innerRadius={50}
                        paddingAngle={4}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "4px", fontSize: "11px", color: "var(--text-muted)", marginTop: "auto" }}>
                  {statusData.map((entry, index) => (
                    <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <div style={{ h: "8px", w: "8px", height: "8px", width: "8px", borderRadius: "50%", backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span>{entry.name}: <strong>{entry.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Quick Actions */}
            <div className="card fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Quick Action Links</h3>
              <div className="grid-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                <button 
                  onClick={() => router.push("/doctor/appointments")}
                  className="btn btn-secondary" 
                  style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px 16px", borderRadius: "14px", alignItems: "flex-start", width: "100%" }}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(59,130,246,0.12)", color: "var(--blue)", display: "flex", alignItems: "center", justifySpace: "center", justifyContent: "center", fontSize: "18px" }}>
                    <FaCalendarAlt />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "white" }}>View Schedule</h4>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Access your appointments list</p>
                  </div>
                </button>

                <button 
                  onClick={() => router.push("/doctor/prescriptions")}
                  className="btn btn-secondary" 
                  style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px 16px", borderRadius: "14px", alignItems: "flex-start", width: "100%" }}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(16,185,129,0.12)", color: "var(--emerald)", display: "flex", alignItems: "center", justifySpace: "center", justifyContent: "center", fontSize: "18px" }}>
                    <FaPrescription />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "white" }}>New Prescription</h4>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Write prescription for patients</p>
                  </div>
                </button>

                <button 
                  onClick={() => router.push("/doctor/availability")}
                  className="btn btn-secondary" 
                  style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px 16px", borderRadius: "14px", alignItems: "flex-start", width: "100%" }}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(139,92,246,0.12)", color: "var(--purple)", display: "flex", alignItems: "center", justifySpace: "center", justifyContent: "center", fontSize: "18px" }}>
                    <FaUser />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "white" }}>Schedules & Leaves</h4>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Manage availability & leaf slots</p>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
