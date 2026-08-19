"use client";

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PolarRadiusAxis
} from "recharts";

const DARK_COLORS = {
  grid: "rgba(255,255,255,0.06)",
  text: "#64748b",
  tooltip: { bg: "#1a2236", border: "rgba(255,255,255,0.12)", text: "#f1f5f9" },
};

const CustomTooltipStyle = {
  backgroundColor: DARK_COLORS.tooltip.bg,
  border: `1px solid ${DARK_COLORS.tooltip.border}`,
  borderRadius: "10px",
  color: DARK_COLORS.tooltip.text,
  fontSize: "13px",
  fontFamily: "Inter, sans-serif",
  padding: "10px 14px",
};

const AxisStyle = { fill: DARK_COLORS.text, fontSize: 11, fontFamily: "Inter" };

/* ─── Appointment Trend (Area) ─── */
export function AppointmentTrendChart({ data }) {
  if (!data || data.length === 0) return <EmptyChart label="No appointment data" />;
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-LK", { month: "short", day: "numeric" }),
    appointments: d.appointmentCount ?? 0,
  }));
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <div className="chart-card-title">Appointment Trends</div>
          <div className="chart-card-sub">Last {data.length} days</div>
        </div>
        <span className="badge badge-blue">Live</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={DARK_COLORS.grid} vertical={false} />
          <XAxis dataKey="date" tick={AxisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={AxisStyle} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={CustomTooltipStyle} />
          <Area type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={2.5}
            fill="url(#apptGrad)" dot={false} activeDot={{ r: 5, fill: "#3b82f6" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Revenue Trend (Area) ─── */
export function RevenueTrendChart({ data }) {
  if (!data || data.length === 0) return <EmptyChart label="No revenue data" />;
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-LK", { month: "short", day: "numeric" }),
    revenue: d.revenue ?? 0,
  }));
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <div className="chart-card-title">Revenue Trends</div>
          <div className="chart-card-sub">LKR income over time</div>
        </div>
        <span className="badge badge-green">Revenue</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={DARK_COLORS.grid} vertical={false} />
          <XAxis dataKey="date" tick={AxisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={AxisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `LKR ${(v/1000).toFixed(0)}k`} />
          <Tooltip contentStyle={CustomTooltipStyle} formatter={(v) => [`LKR ${v.toLocaleString("en-LK")}`, "Revenue"]} />
          <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5}
            fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: "#10b981" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Appointment Status Donut ─── */
export function AppointmentStatusChart({ stats }) {
  if (!stats) return <EmptyChart label="No status data" />;
  const data = [
    { name: "Completed", value: stats.completedAppointments || 0, color: "#10b981" },
    { name: "Pending", value: stats.pendingAppointments || 0, color: "#f59e0b" },
    { name: "Cancelled", value: stats.cancelledAppointments || 0, color: "#f43f5e" },
  ];
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <div className="chart-card-title">Appointment Status</div>
          <div className="chart-card-sub">{total} total appointments</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <ResponsiveContainer width="55%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
              paddingAngle={4} dataKey="value">
              {data.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip contentStyle={CustomTooltipStyle} formatter={(v, n) => [v, n]} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1 }}>
          {data.map((d) => (
            <div key={d.name} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{d.value}</span>
              </div>
              <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 2 }}>
                <div style={{ height: 4, background: d.color, borderRadius: 2, width: total > 0 ? `${(d.value / total) * 100}%` : "0%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Doctor Comparison (Horizontal Bar) ─── */
export function DoctorComparisonChart({ doctors }) {
  if (!doctors || doctors.length === 0) return <EmptyChart label="No doctor data" />;
  const chartData = doctors.map((d) => ({
    name: (d.doctorName || "Unknown").split(" ").slice(0, 2).join(" "),
    total: d.totalAppointments || 0,
    completed: d.completedAppointments || 0,
  }));
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <div className="chart-card-title">Top Doctors Performance</div>
          <div className="chart-card-sub">Appointments comparison</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={DARK_COLORS.grid} horizontal={false} />
          <XAxis type="number" tick={AxisStyle} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={AxisStyle} axisLine={false} tickLine={false} width={80} />
          <Tooltip contentStyle={CustomTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }} />
          <Bar dataKey="total" fill="#3b82f6" name="Total" radius={[0, 4, 4, 0]} />
          <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Disease Trends (Bar) ─── */
export function DiseaseTrendChart({ data }) {
  if (!data || Object.keys(data).length === 0) return <EmptyChart label="No disease data" />;
  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 15) + "…" : name, count }));
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <div className="chart-card-title">Disease Trends</div>
          <div className="chart-card-sub">Top diagnoses by frequency</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={DARK_COLORS.grid} vertical={false} />
          <XAxis dataKey="name" tick={{ ...AxisStyle, fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
          <YAxis tick={AxisStyle} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={CustomTooltipStyle} />
          <Bar dataKey="count" name="Cases" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={["#8b5cf6","#3b82f6","#06b6d4","#10b981","#f59e0b","#f43f5e","#ec4899","#6366f1"][i % 8]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Bed Occupancy (Donut) ─── */
export function BedOccupancyChart({ beds }) {
  const all = beds || [];
  const occupied = all.filter(b => b.status === "OCCUPIED").length;
  const available = all.filter(b => b.status === "AVAILABLE").length;
  const maintenance = all.filter(b => b.status === "MAINTENANCE").length;
  const total = all.length;
  const data = [
    { name: "Occupied", value: occupied, color: "#f43f5e" },
    { name: "Available", value: available, color: "#10b981" },
    { name: "Maintenance", value: maintenance, color: "#f59e0b" },
  ];
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <div className="chart-card-title">Bed Occupancy</div>
          <div className="chart-card-sub">{total} total beds</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>{total > 0 ? Math.round((occupied/total)*100) : 0}%</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>occupied</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ResponsiveContainer width="50%" height={180}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
              {data.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1 }}>
          {data.map(d => (
            <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{d.name}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Doctor Performance Line ─── */
export function DoctorTrendChart({ data }) {
  if (!data || data.length === 0) return <EmptyChart label="No trend data" />;
  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString("en-LK", { month: "short", day: "numeric" }),
    appointments: d.appointmentCount ?? 0,
  }));
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-card-title">My Appointment Trend</div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="drGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={DARK_COLORS.grid} vertical={false} />
          <XAxis dataKey="date" tick={AxisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={AxisStyle} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={CustomTooltipStyle} />
          <Area type="monotone" dataKey="appointments" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#drGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyChart({ label }) {
  return (
    <div className="chart-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 280 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>📊</div>
        <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{label || "No data available"}</div>
      </div>
    </div>
  );
}
