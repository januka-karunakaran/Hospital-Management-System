"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import DashboardCard from "@/app/components/DashboardCard";
import { 
  getDashboardSummary, 
  getDiseaseTrends, 
  getRevenueTrends,
  getTopDoctors
} from "@/services/dashboardService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area,
} from "recharts";
import { FaUsers, FaCalendar, FaMoneyBillWave, FaUserMd, FaVirus } from "react-icons/fa";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#ec4899"];

const TOOLTIP_STYLE = {
  backgroundColor: "#1a2236",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "#f1f5f9",
  fontSize: 13,
  padding: "10px 14px",
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [diseaseData, setDiseaseData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summary, diseases, revenue, doctors] = await Promise.all([
          getDashboardSummary(),
          getDiseaseTrends(),
          getRevenueTrends(7),
          getTopDoctors(5),
        ]);
        setData(summary);
        const formattedDiseases = Object.entries(diseases).map(([name, value]) => ({ name, value }));
        setDiseaseData(formattedDiseases);
        setRevenueData(revenue);
        setTopDoctors(doctors);
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
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", overflow: "hidden" }}>
          <Sidebar />
          <main style={{ flex: 1, minWidth: 0, overflowX: "hidden", padding: "20px 24px" }}>
            <Topbar />
            <div className="grid-4" style={{ marginTop: 24 }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 14 }} />)}
            </div>
            <div className="grid-2" style={{ marginTop: 16 }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 14 }} />)}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "20px 24px", overflowX: "hidden", minWidth: 0 }}>
          <Topbar />

          {error && (
            <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, color: "#fb7185", fontSize: 13 }}>
              Warning: {error}
            </div>
          )}

          {/* Page title */}
          <div style={{ marginTop: 22, marginBottom: 18 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
              Analytics Overview
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              Real-time hospital performance metrics
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid-4" style={{ marginBottom: 16 }}>
            <DashboardCard
              title="Total Patients"
              value={data?.userStats?.totalPatients ?? 0}
              subtitle={`+${data?.userStats?.newPatientsThisMonth ?? 0} this month`}
              icon={<FaUsers />}
              color="var(--blue)"
            />
            <DashboardCard
              title="Total Doctors"
              value={data?.userStats?.totalDoctors ?? 0}
              subtitle="Registered specialists"
              icon={<FaUserMd />}
              color="var(--cyan)"
            />
            <DashboardCard
              title="Appointments"
              value={data?.appointmentStats?.totalAppointments ?? 0}
              subtitle={`${data?.appointmentStats?.pendingAppointments ?? 0} pending`}
              icon={<FaCalendar />}
              color="var(--purple)"
            />
            <DashboardCard
              title="Monthly Revenue"
              value={`LKR ${(data?.revenueStats?.monthlyRevenue ?? 0).toLocaleString("en-LK")}`}
              subtitle={`Avg: LKR ${(data?.revenueStats?.avgConsultationFee ?? 0).toLocaleString("en-LK")} / consult`}
              icon={<FaMoneyBillWave />}
              color="var(--emerald)"
            />
          </div>

          {/* Revenue Trend + Disease Distribution */}
          <div className="grid-2" style={{ marginBottom: 16 }}>
            {/* Revenue Trend */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Revenue Trend</div>
                  <div className="chart-card-sub">Last 7 days</div>
                </div>
                <span className="badge badge-green">Last 7 Days</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Disease Distribution */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Disease Distribution</div>
                  <div className="chart-card-sub">Top diagnosis categories</div>
                </div>
              </div>
              {diseaseData.length === 0 ? (
                <div className="empty-state" style={{ padding: "40px 20px" }}>
                  <div className="empty-state-icon"><FaVirus /></div>
                  <div className="empty-state-title">No data yet</div>
                  <div className="empty-state-sub">Disease trends will appear as appointments are completed</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={diseaseData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={55} paddingAngle={4}>
                      {diseaseData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Doctors + Appointment Activity */}
          <div className="grid-2" style={{ marginBottom: 16 }}>
            {/* Top Doctors */}
            <div className="card">
              <div className="section-title">
                <FaUserMd style={{ color: "var(--blue)" }} /> Top Performing Doctors
              </div>
              {topDoctors.length === 0 ? (
                <div className="empty-state" style={{ padding: "30px 20px" }}>
                  <div className="empty-state-icon"><FaUserMd /></div>
                  <div className="empty-state-title">No doctor data yet</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {topDoctors.map((doc, idx) => (
                    <div key={doc.doctorId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--border)" }}>
                      <div className={`avatar avatar-${["blue","cyan","emerald","purple","rose"][idx % 5]}`} style={{ fontSize: 11 }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {doc.doctorName}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{doc.specialization}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 13 }}>{doc.totalAppointments}</div>
                        <div style={{ fontSize: 11 }}>
                          <span className="badge badge-blue">{(doc.appointmentRate ?? 0).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Appointment Activity Bar */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Appointment Activity</div>
                  <div className="chart-card-sub">Daily appointment volume</div>
                </div>
              </div>
              {revenueData.length === 0 ? (
                <div className="empty-state" style={{ padding: "40px 20px" }}>
                  <div className="empty-state-icon"><FaCalendar /></div>
                  <div className="empty-state-title">No activity data yet</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="appointmentCount" name="Appointments" fill="#8b5cf6" radius={[5, 5, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Appointment Stats Summary */}
          {data?.appointmentStats && (
            <div className="grid-4" style={{ marginBottom: 16 }}>
              {[
                { label: "Completed", value: data.appointmentStats.completedAppointments ?? 0, color: "var(--emerald)" },
                { label: "Pending", value: data.appointmentStats.pendingAppointments ?? 0, color: "var(--amber)" },
                { label: "Cancelled", value: data.appointmentStats.cancelledAppointments ?? 0, color: "var(--rose)" },
                { label: "Completion Rate", value: `${(data.appointmentStats.completionRate ?? 0).toFixed(1)}%`, color: "var(--blue)" },
              ].map(({ label, value, color }) => (
                <div key={label} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
                  </div>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}` }} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
