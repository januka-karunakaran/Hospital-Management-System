"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaUserMd,
  FaUsers,
  FaCalendarCheck,
  FaPrescriptionBottleAlt,
  FaSignOutAlt,
  FaBed,
  FaFileAlt,
  FaMoneyBillWave,
  FaUserPlus,
  FaUserCog,
  FaStethoscope,
  FaCalendarAlt,
  FaHeartbeat,
  FaSearch,
} from "react-icons/fa";
import { clearSession, getRefreshToken, getRole } from "@/utils/auth";
import { logoutUser } from "@/services/authService";
import BrandLogo from "./BrandLogo";

const adminLinks = [
  { section: "Overview" },
  { href: "/admin/dashboard", label: "Dashboard", icon: <FaHome /> },
  { href: "/admin/reports", label: "Reports", icon: <FaFileAlt /> },
  { section: "People" },
  { href: "/admin/doctors", label: "Doctors", icon: <FaUserMd /> },
  { href: "/admin/patients", label: "Patients", icon: <FaUsers /> },
  { href: "/admin/create-doctor", label: "Add Doctor", icon: <FaUserPlus /> },
  { href: "/admin/create-patient", label: "Add Patient", icon: <FaUserPlus /> },
  { section: "Operations" },
  { href: "/admin/appointments", label: "Appointments", icon: <FaCalendarCheck /> },
  { href: "/admin/prescriptions", label: "Prescriptions", icon: <FaPrescriptionBottleAlt /> },
  { href: "/admin/beds", label: "Bed Management", icon: <FaBed /> },
  { href: "/admin/billing", label: "Billing", icon: <FaMoneyBillWave /> },
  { section: "Account" },
  { href: "/profile", label: "Profile", icon: <FaUserCog /> },
];

const doctorLinks = [
  { section: "Overview" },
  { href: "/doctor/dashboard", label: "Dashboard", icon: <FaHome /> },
  { section: "Work" },
  { href: "/doctor/appointments", label: "Appointments", icon: <FaCalendarCheck /> },
  { href: "/doctor/prescriptions", label: "Prescriptions", icon: <FaPrescriptionBottleAlt /> },
  { href: "/doctor/availability", label: "Availability", icon: <FaCalendarAlt /> },
  { section: "Account" },
  { href: "/profile", label: "Profile", icon: <FaUserCog /> },
];

const patientLinks = [
  { section: "Overview" },
  { href: "/patient/dashboard", label: "Dashboard", icon: <FaHeartbeat /> },
  { section: "Health" },
  { href: "/patient/appointments", label: "Book Appointment", icon: <FaCalendarCheck /> },
  { href: "/patient/my-appointments", label: "My Appointments", icon: <FaCalendarAlt /> },
  { href: "/patient/my-prescriptions", label: "My Prescriptions", icon: <FaPrescriptionBottleAlt /> },
  { section: "Account" },
  { href: "/profile", label: "Profile", icon: <FaUserCog /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const role = getRole();

  let links = [];
  if (role === "ADMIN") links = adminLinks;
  else if (role === "DOCTOR") links = doctorLinks;
  else if (role === "PATIENT") links = patientLinks;

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch (error) {
      console.error(error);
    } finally {
      clearSession();
      window.location.href = "/login";
    }
  };

  const brandLabel = role === "ADMIN" ? "Admin Panel" : role === "DOCTOR" ? "Doctor Portal" : "Patient Portal";

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon"><BrandLogo size={34} /></div>
        <div>
          <div className="sidebar-brand-name">MediCore</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>{brandLabel}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {links.map((link, i) => {
          if (link.section) {
            return (
              <div key={`section-${i}`} className="sidebar-section-label">
                {link.section}
              </div>
            );
          }
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link${isActive ? " active" : ""}`}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="sidebar-logout">
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", color: "var(--rose)" }}
        >
          <span className="sidebar-link-icon"><FaSignOutAlt /></span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

