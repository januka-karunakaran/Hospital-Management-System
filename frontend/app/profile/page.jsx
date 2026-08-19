"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import SilentLogin from "@/app/components/SilentLogin";
import { apiFetch } from "@/services/api";
import { saveSession, getUser } from "@/utils/auth";
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, 
  FaImage, FaGraduationCap, FaIdCard, FaEdit, FaSave, 
  FaCheckCircle, FaExclamationCircle 
} from "react-icons/fa";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    role: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    photoUrl: "",
    bio: "",
    specialization: "",
    licenseNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch("/users/me");
        setProfile(data);
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const data = await apiFetch("/users/me", {
        method: "PUT",
        body: JSON.stringify(profile),
      });
      setProfile(data);
      
      // Update session if email or name changed
      const currentUser = getUser();
      saveSession({
        ...currentUser,
        fullName: data.fullName,
        email: data.email,
        token: localStorage.getItem("access_token"), // Keep current tokens
        refreshToken: localStorage.getItem("refresh_token"),
        role: data.role
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0a0e1a] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Get initials for profile placeholder
  const getInitials = (name) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <ProtectedRoute>
      <SilentLogin />
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Topbar />

          <div className="page-content">
            {/* Header */}
            <div className="page-header">
              <h1>Account Settings</h1>
              <p>Manage your personal profile details and preference settings</p>
            </div>

            {/* Profile Content Area */}
            <div className="card fade-in" style={{ padding: 0, overflow: "hidden", maxWidth: "900px", margin: "0 auto", width: "100%" }}>
              
              {/* Profile Banner */}
              <div style={{ height: "140px", background: "linear-gradient(135deg, var(--blue-dark), var(--purple))", position: "relative" }}></div>
              
              {/* Profile Details Container */}
              <div style={{ padding: "24px 32px 32px" }}>
                
                {/* Profile Picture Header */}
                <div style={{ display: "flex", gap: "24px", alignItems: "flex-end", marginTop: "-70px", marginBottom: "28px", flexWrap: "wrap" }}>
                  <div style={{ position: "relative" }}>
                    {profile.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.fullName}
                        style={{ h: "100px", w: "100px", height: "100px", width: "100px", borderRadius: "16px", objectFit: "cover", border: "4px solid var(--surface)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ height: "100px", width: "100px", borderRadius: "16px", background: "linear-gradient(135deg, var(--blue), var(--cyan))", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "800", border: "4px solid var(--surface)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                        {getInitials(profile.fullName)}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "800", color: "white", letterSpacing: "-0.5px" }}>{profile.fullName}</h2>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500", marginTop: "2px" }}>
                      <span className="badge badge-cyan" style={{ marginRight: "8px" }}>{profile.role}</span>
                      {profile.email}
                    </p>
                  </div>
                </div>

                {/* Notifications */}
                {message.text && (
                  <div className={message.type === 'success' ? 'badge-green' : 'badge-red'} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "24px", textTransform: "none" }}>
                    {message.type === 'success' ? <FaCheckCircle style={{ fontSize: "16px" }} /> : <FaExclamationCircle style={{ fontSize: "16px" }} />}
                    <span>{message.text}</span>
                  </div>
                )}

                {/* Profile Form */}
                <form onSubmit={handleSubmit}>
                  <div className="grid-2" style={{ marginBottom: "20px" }}>
                    <div>
                      <label className="hms-label">Full Name</label>
                      <div className="search-bar" style={{ padding: "10px 12px" }}>
                        <FaUser style={{ color: "var(--text-muted)" }} />
                        <input
                          type="text"
                          name="fullName"
                          value={profile.fullName}
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
                          type="email"
                          name="email"
                          value={profile.email}
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
                          type="text"
                          name="phoneNumber"
                          value={profile.phoneNumber || ""}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="hms-label">Profile Image URL</label>
                      <div className="search-bar" style={{ padding: "10px 12px" }}>
                        <FaImage style={{ color: "var(--text-muted)" }} />
                        <input
                          type="text"
                          name="photoUrl"
                          value={profile.photoUrl || ""}
                          onChange={handleChange}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div style={{ marginBottom: "20px" }}>
                    <label className="hms-label">Street Address</label>
                    <div className="search-bar" style={{ padding: "10px 12px" }}>
                      <FaMapMarkerAlt style={{ color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        name="address"
                        value={profile.address || ""}
                        onChange={handleChange}
                        placeholder="123 Hospital St"
                      />
                    </div>
                  </div>

                  <div className="grid-3" style={{ marginBottom: "24px" }}>
                    <div>
                      <label className="hms-label">City</label>
                      <div className="search-bar" style={{ padding: "10px 12px" }}>
                        <FaGlobe style={{ color: "var(--text-muted)" }} />
                        <input
                          type="text"
                          name="city"
                          value={profile.city || ""}
                          onChange={handleChange}
                          placeholder="New York"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="hms-label">State</label>
                      <div className="search-bar" style={{ padding: "10px 12px" }}>
                        <FaGlobe style={{ color: "var(--text-muted)" }} />
                        <input
                          type="text"
                          name="state"
                          value={profile.state || ""}
                          onChange={handleChange}
                          placeholder="NY"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="hms-label">Zip Code</label>
                      <div className="search-bar" style={{ padding: "10px 12px" }}>
                        <FaGlobe style={{ color: "var(--text-muted)" }} />
                        <input
                          type="text"
                          name="zipCode"
                          value={profile.zipCode || ""}
                          onChange={handleChange}
                          placeholder="10001"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Doctor Fields */}
                  {profile.role === 'DOCTOR' && (
                    <div className="grid-2" style={{ marginBottom: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
                      <div>
                        <label className="hms-label">Clinical Specialization</label>
                        <div className="search-bar" style={{ padding: "10px 12px" }}>
                          <FaGraduationCap style={{ color: "var(--text-muted)" }} />
                          <input
                            type="text"
                            name="specialization"
                            value={profile.specialization || ""}
                            onChange={handleChange}
                            placeholder="e.g. Cardiology"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="hms-label">Medical License Number</label>
                        <div className="search-bar" style={{ padding: "10px 12px" }}>
                          <FaIdCard style={{ color: "var(--text-muted)" }} />
                          <input
                            type="text"
                            name="licenseNumber"
                            value={profile.licenseNumber || ""}
                            onChange={handleChange}
                            placeholder="e.g. LIC-9812739"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bio Description */}
                  <div style={{ marginBottom: "28px" }}>
                    <label className="hms-label">Short Biography</label>
                    <div className="search-bar" style={{ padding: "10px 12px" }}>
                      <textarea
                        name="bio"
                        value={profile.bio || ""}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                        style={{ width: "100%", background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontFamily: "inherit", minHeight: "80px", resize: "vertical", fontSize: "13px" }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn btn-primary"
                    >
                      <FaSave /> {saving ? "Saving Changes..." : "Save Profile"}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
