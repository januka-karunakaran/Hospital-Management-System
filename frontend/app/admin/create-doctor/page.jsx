"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { createDoctor } from "@/services/adminService";
import { FaUserMd, FaEnvelope, FaPhone, FaBriefcase, FaGraduationCap, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function CreateDoctorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    experienceYears: "",
  });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.specialization) {
      setErr("Name, email, and specialization are required");
      return;
    }

    try {
      setLoading(true);
      setErr("");
      setMsg("");
      await createDoctor({
        ...form,
        experienceYears: Number(form.experienceYears || 0),
      });
      setMsg("Doctor successfully registered in database.");
      setForm({
        fullName: "",
        email: "",
        phone: "",
        specialization: "",
        experienceYears: "",
      });
    } catch (e) {
      setErr(e.message || "Failed to create doctor profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Topbar />

          <div className="page-content">
            {/* Header */}
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1>Register New Doctor</h1>
                <p>Add a new practitioner profile to the hospital system</p>
              </div>
              <button 
                onClick={() => router.push("/admin/doctors")} 
                className="btn btn-secondary"
              >
                <FaArrowLeft /> Back to Doctors
              </button>
            </div>

            {/* Form Card */}
            <div className="card fade-in" style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "linear-gradient(135deg, var(--blue), var(--cyan))", display: "flex", alignItems: "center", justifySpace: "center", justifyContent: "center", fontSize: "20px", color: "white" }}>
                  <FaUserMd />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Doctor Information</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Fill in the doctor's contact and practice details</p>
                </div>
              </div>

              {msg && (
                <div className="badge-green" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px", textTransform: "none" }}>
                  <FaCheckCircle style={{ fontSize: "16px" }} />
                  <span>{msg}</span>
                </div>
              )}

              {err && (
                <div className="badge-red" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px", textTransform: "none" }}>
                  <FaExclamationCircle style={{ fontSize: "16px" }} />
                  <span>{err}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid-2" style={{ marginBottom: "20px" }}>
                  <div>
                    <label className="hms-label">Full Name</label>
                    <div className="search-bar" style={{ padding: "10px 12px" }}>
                      <FaUserMd style={{ color: "var(--text-muted)" }} />
                      <input
                        name="fullName"
                        type="text"
                        placeholder="Dr. John Doe"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="hms-label">Email Address</label>
                    <div className="search-bar" style={{ padding: "10px 12px" }}>
                      <FaEnvelope style={{ color: "var(--text-muted)" }} />
                      <input
                        name="email"
                        type="email"
                        placeholder="john.doe@hospital.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="hms-label">Phone Number</label>
                    <div className="search-bar" style={{ padding: "10px 12px" }}>
                      <FaPhone style={{ color: "var(--text-muted)" }} />
                      <input
                        name="phone"
                        type="text"
                        placeholder="+1 (555) 019-2834"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="hms-label">Specialization</label>
                    <div className="search-bar" style={{ padding: "10px 12px" }}>
                      <FaGraduationCap style={{ color: "var(--text-muted)" }} />
                      <input
                        name="specialization"
                        type="text"
                        placeholder="Cardiology / Pediatrics / Neurology"
                        value={form.specialization}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label className="hms-label">Years of Experience</label>
                  <div className="search-bar" style={{ padding: "10px 12px" }}>
                    <FaBriefcase style={{ color: "var(--text-muted)" }} />
                    <input
                      name="experienceYears"
                      type="number"
                      placeholder="e.g. 8"
                      value={form.experienceYears}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                  <button 
                    type="button"
                    onClick={() => router.push("/admin/doctors")} 
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Register Doctor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
