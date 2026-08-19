"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import SilentLogin from "@/app/components/SilentLogin";
import { setAvailability, getDoctorAvailability, deleteAvailability } from "@/services/doctorService";
import { getUser } from "@/utils/auth";
import { 
  FaCalendarPlus, FaTrashAlt, FaClock, FaCheckCircle, 
  FaTimesCircle, FaRegCalendarAlt, FaBriefcase, FaAlignLeft, 
  FaExclamationCircle 
} from "react-icons/fa";

export default function AvailabilityPage() {
  const user = getUser();
  const userId = user?.userId;
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: "MONDAY",
    timeSlots: "",
    isAvailable: true,
    reason: ""
  });

  const loadAvailability = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getDoctorAvailability(userId);
      setAvailabilities(data.map((item) => ({
        ...item,
        isAvailable: item.isAvailable ?? item.available ?? false,
      })));
    } catch (err) {
      setError("Failed to load availability settings.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const timerId = window.setTimeout(loadAvailability, 0);
    return () => window.clearTimeout(timerId);
  }, [loadAvailability]);

  const handleSetAvailability = async (e) => {
    e.preventDefault();
    if (newSlot.isAvailable && !newSlot.timeSlots) {
      setError("Please provide at least one time slot.");
      return;
    }
    try {
      setError("");
      setSuccess("");
      const slots = newSlot.isAvailable 
        ? newSlot.timeSlots.split(",").map(s => s.trim()).filter(Boolean)
        : [];
        
      await setAvailability({
        ...newSlot,
        doctorId: user.userId,
        timeSlots: slots,
        available: newSlot.isAvailable,
      });
      setSuccess("Schedule settings saved successfully.");
      loadAvailability();
      setNewSlot({ dayOfWeek: "MONDAY", timeSlots: "", isAvailable: true, reason: "" });
    } catch (err) {
      setError("Failed to save availability settings.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this schedule slot?")) {
      return;
    }
    try {
      setError("");
      setSuccess("");
      await deleteAvailability(id);
      setSuccess("Schedule slot removed successfully.");
      loadAvailability();
    } catch (err) {
      setError("Failed to delete availability.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0a0e1a] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

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
              <h1>Availability & Leaves</h1>
              <p>Configure your weekly consultation slots and record upcoming leave details</p>
            </div>

            {/* Success & Error alerts */}
            {success && (
              <div className="badge-green fade-in" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", textTransform: "none" }}>
                <FaCheckCircle style={{ fontSize: "16px" }} />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="badge-red fade-in" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", textTransform: "none" }}>
                <FaExclamationCircle style={{ fontSize: "16px" }} />
                <span>{error}</span>
              </div>
            )}

            <div className="grid-3" style={{ gridTemplateColumns: "1fr 2fr" }}>
              
              {/* Form Card */}
              <div className="card fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px", height: "fit-content" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                  <FaCalendarPlus style={{ color: "var(--blue)" }} />
                  <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Configure Slot</h3>
                </div>

                <form onSubmit={handleSetAvailability}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    
                    <div>
                      <label className="hms-label">Day of Week</label>
                      <div className="search-bar" style={{ padding: "10px 12px" }}>
                        <FaRegCalendarAlt style={{ color: "var(--text-muted)" }} />
                        <select 
                          value={newSlot.dayOfWeek}
                          onChange={(e) => setNewSlot({...newSlot, dayOfWeek: e.target.value})}
                          className="hms-select"
                          style={{ border: "none", background: "none", padding: "0 4px", width: "100%", color: "var(--text-primary)" }}
                        >
                          {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", py: "4px" }}>
                      <input 
                        type="checkbox" 
                        id="isAvailable"
                        checked={newSlot.isAvailable} 
                        onChange={(e) => setNewSlot({...newSlot, isAvailable: e.target.checked})}
                        style={{ cursor: "pointer", height: "16px", width: "16px", accentColor: "var(--cyan)" }}
                      />
                      <label htmlFor="isAvailable" style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", cursor: "pointer" }}>
                        Available for Consultations
                      </label>
                    </div>

                    {newSlot.isAvailable ? (
                      <div>
                        <label className="hms-label">Time Slots (Comma separated)</label>
                        <div className="search-bar" style={{ padding: "10px 12px" }}>
                          <FaClock style={{ color: "var(--text-muted)" }} />
                          <input 
                            type="text" 
                            placeholder="e.g. 09:00, 10:30, 14:00"
                            value={newSlot.timeSlots}
                            onChange={(e) => setNewSlot({...newSlot, timeSlots: e.target.value})}
                            style={{ border: "none", background: "none", outline: "none", width: "100%", color: "var(--text-primary)" }}
                          />
                        </div>
                        <span style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>Use 24h format or AM/PM separated by commas</span>
                      </div>
                    ) : (
                      <div>
                        <label className="hms-label">Reason for Absence / Leave</label>
                        <div className="search-bar" style={{ padding: "10px 12px" }}>
                          <FaAlignLeft style={{ color: "var(--text-muted)", marginTop: "3px", alignSelf: "flex-start" }} />
                          <textarea 
                            value={newSlot.reason}
                            onChange={(e) => setNewSlot({...newSlot, reason: e.target.value})}
                            placeholder="e.g. Annual leave, Medical conference..."
                            style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", width: "100%", fontFamily: "inherit", minHeight: "60px", resize: "none" }}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ justifyContent: "center", marginTop: "8px" }}
                    >
                      Save Settings
                    </button>
                  </div>
                </form>
              </div>

              {/* List Grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Weekly Schedule List</h3>
                
                {availabilities.length === 0 ? (
                  <div className="card" style={{ textAlign: "center", padding: "40px" }}>
                    <FaRegCalendarAlt style={{ fontSize: "32px", color: "var(--text-muted)", marginBottom: "8px" }} />
                    <p style={{ color: "var(--text-secondary)" }}>No schedule or leave configurations created yet.</p>
                  </div>
                ) : (
                  <div className="grid-2">
                    {availabilities.map((avail) => (
                      <div key={avail.id} className="card fade-in group" style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: `4px solid ${
                        avail.isAvailable ? "var(--emerald)" : "var(--rose)"
                      }` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: avail.isAvailable ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)", color: avail.isAvailable ? "var(--emerald)" : "var(--rose)", display: "flex", alignItems: "center", justifySpace: "center", justifyContent: "center", fontSize: "13px" }}>
                              {avail.isAvailable ? <FaCheckCircle /> : <FaTimesCircle />}
                            </div>
                            <div>
                              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "white" }}>{avail.dayOfWeek}</h4>
                              <span className={`badge ${avail.isAvailable ? "badge-green" : "badge-rose"}`} style={{ fontSize: "9px", padding: "2px 6px", marginTop: "2px" }}>
                                {avail.isAvailable ? "Available" : "On Leave"}
                              </span>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleDelete(avail.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: "6px", borderRadius: "6px", border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.1s" }}
                            title="Delete Schedule"
                          >
                            <FaTrashAlt style={{ color: "var(--rose)", fontSize: "11px" }} />
                          </button>
                        </div>

                        {avail.isAvailable ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                            {avail.timeSlots?.map(slot => (
                              <span key={slot} className="stat-pill" style={{ fontSize: "11px", display: "inline-flex", gap: "4px", padding: "3px 8px" }}>
                                <FaClock style={{ fontSize: "10px", marginTop: "1px" }} /> {slot}
                              </span>
                            ))}
                            {(!avail.timeSlots || avail.timeSlots.length === 0) && (
                              <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>No time slots configured</span>
                            )}
                          </div>
                        ) : (
                          <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic", background: "var(--surface-2)", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border)", marginTop: "4px" }}>
                            Reason: &quot;{avail.reason || "No reason provided"}&quot;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
