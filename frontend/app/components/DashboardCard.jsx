export default function DashboardCard({ title, value, subtitle, icon, color = "var(--blue)" }) {
  return (
    <div className="kpi-card" style={{ "--kpi-color": color }}>
      {icon && (
        <div className="kpi-icon" style={{ background: `${color}18`, color }}>
          {icon}
        </div>
      )}
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{title}</div>
      {subtitle && <div className="kpi-sub">{subtitle}</div>}
    </div>
  );
}

