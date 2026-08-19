"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import {
  AppointmentTrendChart,
  RevenueTrendChart,
  AppointmentStatusChart,
  DoctorComparisonChart,
  DiseaseTrendChart,
} from "@/components/Charts";
import {
  getDashboardSummary,
  getAppointmentTrends,
  getRevenueTrends,
  getTopDoctors,
  getDiseaseTrends,
} from "@/services/dashboardService";
import { getToken } from "@/utils/auth";
import {
  FaUsers,
  FaCalendar,
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaUserMd,
  FaSync,
  FaChartLine,
} from "react-icons/fa";

const KpiCard = ({ icon, label, value, sub, color }) => (
  <div className="kpi-card" style={{ "--kpi-color": color }}>
    <div className="kpi-icon" style={{ background: `${color}20` }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-label">{label}</div>
    {sub && <div className="kpi-sub">{sub}</div>}
  </div>
);

export default function AdminDashboard() {
  const router = useRouter();
  const token = typeof window !== "undefined" ? getToken() : "";

  const [summary, setSummary] = useState(null);
  const [appointmentTrends, setAppointmentTrends] = useState([]);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [diseaseTrends, setDiseaseTrends] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const [summaryData, trendsData, revenueData, doctorsData, diseaseData] =
        await Promise.all([
          getDashboardSummary(),
          getAppointmentTrends(30),
          getRevenueTrends(30),
          getTopDoctors(5),
          getDiseaseTrends(),
        ]);
      setSummary(summaryData);
      setAppointmentTrends(trendsData);
      setRevenueTrends(revenueData);
      setTopDoctors(doctorsData);
      setDiseaseTrends(diseaseData);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    const timerId = window.setTimeout(loadDashboardData, 0);
    return () => window.clearTimeout(timerId);
  }, [loadDashboardData, token, router]);

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          <main style={{ flex: 1, padding: 24 }}>
            <Topbar />
            <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 14 }} />)}
            </div>
            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
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
        <main style={{ flex: 1, minWidth: 0, overflowX: "hidden", padding: "20px 24px" }}>
          <Topbar />

          {error && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, color: "#fb7185", fontSize: 13 }}>
              Warning: {error}
            </div>
          )}

          {/* Header */}
          <div style={{ marginTop: 24, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>Analytics Dashboard</h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Hospital management overview & real-time stats</p>
            </div>
            <button
              onClick={loadDashboardData}
              className="btn btn-secondary btn-sm"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <FaSync style={{ fontSize: 11 }} /> Refresh
            </button>
          </div>

          {summary && (
            <>
              {/* KPI Row 1 */}
              <div className="grid-4" style={{ marginBottom: 16 }}>
                <KpiCard icon={<FaUsers />} label="Total Users" value={summary.userStats?.totalUsers || 0}
                  sub={`${summary.userStats?.totalDoctors || 0} Doctors · ${summary.userStats?.totalPatients || 0} Patients`}
                  color="var(--blue)" />
                <KpiCard icon={<FaCalendar />} label="Total Appointments" value={summary.appointmentStats?.totalAppointments || 0}
                  sub={`${(summary.appointmentStats?.completionRate || 0).toFixed(1)}% completion rate`}
                  color="var(--purple)" />
                <KpiCard icon={<FaMoneyBillWave />} label="Monthly Revenue" value={`LKR ${(summary.revenueStats?.monthlyRevenue || 0).toLocaleString("en-LK", { maximumFractionDigits: 0 })}`}
                  sub={`Daily avg: LKR ${(summary.revenueStats?.dailyRevenue || 0).toLocaleString("en-LK", { maximumFractionDigits: 0 })}`}
                  color="var(--emerald)" />
                <KpiCard icon={<FaClock />} label="Active Today" value={summary.userStats?.activeAppointmentsToday || 0}
                  sub="Appointments today"
                  color="var(--amber)" />
              </div>

              {/* KPI Row 2 - Appointment Status */}
              <div className="grid-3" style={{ marginBottom: 16 }}>
                <KpiCard icon={<FaCheckCircle />} label="Completed" value={summary.appointmentStats?.completedAppointments || 0}
                  color="var(--emerald)" />
                <KpiCard icon={<FaClock />} label="Pending" value={summary.appointmentStats?.pendingAppointments || 0}
                  color="var(--amber)" />
                <KpiCard icon={<FaTimesCircle />} label="Cancelled" value={summary.appointmentStats?.cancelledAppointments || 0}
                  color="var(--rose)" />
              </div>

              {/* Charts Row 1 */}
              <div className="grid-2" style={{ marginBottom: 16 }}>
                <AppointmentTrendChart data={appointmentTrends} />
                <RevenueTrendChart data={revenueTrends} />
              </div>

              {/* Charts Row 2 */}
              <div className="grid-2" style={{ marginBottom: 16 }}>
                <AppointmentStatusChart stats={summary.appointmentStats} />
                <DoctorComparisonChart doctors={topDoctors} />
              </div>

              {/* Disease Trends */}
              {Object.keys(diseaseTrends).length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <DiseaseTrendChart data={diseaseTrends} />
                </div>
              )}

              {/* Top Doctors Table */}
              {topDoctors && topDoctors.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div className="section-title" style={{ marginBottom: 0 }}>
                      <FaUserMd style={{ color: "var(--blue)" }} /> Top Performing Doctors
                    </div>
                    <span className="badge badge-blue">Top 5</span>
                  </div>
                  <div className="table-wrap">
                    <table className="hms-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Doctor Name</th>
                          <th>Specialization</th>
                          <th style={{ textAlign: "center" }}>Total</th>
                          <th style={{ textAlign: "center" }}>Completed</th>
                          <th style={{ textAlign: "center" }}>Rating</th>
                          <th style={{ textAlign: "center" }}>Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topDoctors.map((doctor, i) => (
                          <tr key={doctor.doctorId}>
                            <td style={{ color: "var(--text-muted)", fontWeight: 700 }}>{i + 1}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div className={`avatar avatar-${["blue","cyan","emerald","purple","rose"][i % 5]}`} style={{ width: 30, height: 30, fontSize: 11 }}>
                                  {(doctor.doctorName || "?")[0]}
                                </div>
                                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{doctor.doctorName}</span>
                              </div>
                            </td>
                            <td>{doctor.specialization}</td>
                            <td style={{ textAlign: "center" }}>{doctor.totalAppointments}</td>
                            <td style={{ textAlign: "center" }}>
                              <span style={{ color: "var(--emerald)", fontWeight: 600 }}>{doctor.completedAppointments}</span>
                            </td>
                            <td style={{ textAlign: "center" }}>★ {(doctor.avgRating || 0).toFixed(1)}</td>
                            <td style={{ textAlign: "center" }}>
                              <span className="badge badge-blue">{(doctor.appointmentRate || 0).toFixed(1)}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

