"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { createPatient } from "@/services/adminService";
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaVenusMars, FaTint, FaMapMarkerAlt, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function CreatePatientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    gender: "MALE",
    bloodGroup: "O+",
    address: "",
  });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email) {
      setErr("Name and email are required");
      return;
    }

    try {
      setLoading(true);
      setErr("");
      setMsg("");
      await createPatient({
        ...form,
        age: Number(form.age || 0),
      });
      setMsg("Patient profile created successfully.");
      setForm({
        fullName: "",
        email: "",
        phone: "",
        age: "",
        gender: "MALE",
        bloodGroup: "O+",
        address: "",
      });
    } catch (e) {
      setErr(e.message || "Failed to create patient profile.");
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
                <h1>Register New Patient</h1>
                <p>Add a new patient admission record to the database</p>
              </div>
              <button 
                onClick={() => router.push("/admin/patients")} 
                className="btn btn-secondary"
              >
                <FaArrowLeft /> Back to Patients
              </button>
            </div>

            {/* Form Card */}
            <div className="card fade-in" style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "linear-gradient(135deg, var(--blue), var(--cyan))", display: "flex", alignItems: "center", justifySpace: "center", justifyContent: "center", fontSize: "20px", color: "white" }}>
                  <FaUser />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Patient Personal & Clinical Details</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Fill in the fields below to register the patient</p>
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
                      <FaUser style={{ color: "var(--text-muted)" }} />
                      <input
                        name="fullName"
                        type="text"
                        placeholder="John Doe"
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
                        placeholder="john.doe@example.com"
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
                        placeholder="+1 (555) 123-4567"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="hms-label">Age</label>
                    <div className="search-bar" style={{ padding: "10px 12px" }}>
                      <FaCalendarAlt style={{ color: "var(--text-muted)" }} />
                      <input
                        name="age"
                        type="number"
                        placeholder="e.g. 35"
                        value={form.age}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="hms-label">Gender</label>
                    <div className="search-bar" style={{ padding: "10px 12px" }}>
                      <FaVenusMars style={{ color: "var(--text-muted)" }} />
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="hms-select"
                        style={{ border: "none", background: "none", padding: "0 4px", width: "100%", color: "var(--text-primary)" }}
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="hms-label">Blood Group</label>
                    <div className="search-bar" style={{ padding: "10px 12px" }}>
                      <FaTint style={{ color: "var(--text-muted)" }} />
                      <select
                        name="bloodGroup"
                        value={form.bloodGroup}
                        onChange={handleChange}
                        className="hms-select"
                        style={{ border: "none", background: "none", padding: "0 4px", width: "100%", color: "var(--text-primary)" }}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label className="hms-label">Residential Address</label>
                  <div className="search-bar" style={{ padding: "10px 12px" }}>
                    <FaMapMarkerAlt style={{ color: "var(--text-muted)", marginTop: "3px", alignSelf: "flex-start" }} />
                    <textarea
                      name="address"
                      placeholder="123 Health Ave, Medical City, MC 90210"
                      value={form.address}
                      onChange={handleChange}
                      style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", width: "100%", fontFamily: "inherit", minHeight: "60px", resize: "vertical" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                  <button 
                    type="button"
                    onClick={() => router.push("/admin/patients")} 
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
                    {loading ? "Registering..." : "Register Patient"}
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
