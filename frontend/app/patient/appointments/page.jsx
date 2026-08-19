"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { getUser } from "@/utils/auth";
import { 
  createAppointment,
  getAllDoctors,
  getAvailableSlots,
} from "@/services/appointmentService";
import { FaUserMd, FaCalendarAlt, FaClock, FaCommentMedical, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotInfo, setSlotInfo] = useState(null);
  const [bookingReceipt, setBookingReceipt] = useState(null);

  const user = typeof window !== "undefined" ? getUser() : null;

  useEffect(() => {
    getAllDoctors()
      .then((data) => setDoctors(data.filter((doctor) => doctor.status !== "INACTIVE")))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!form.doctorId || !form.appointmentDate) {
      return;
    }

    let cancelled = false;
    const timerId = window.setTimeout(() => {
      setSlotsLoading(true);
      setError("");
      getAvailableSlots(form.doctorId, form.appointmentDate)
        .then((data) => {
          if (!cancelled) setSlotInfo(data);
        })
        .catch((err) => {
          if (!cancelled) {
            setSlotInfo(null);
            setError(err.message || "Failed to load the doctor's schedule");
          }
        })
        .finally(() => {
          if (!cancelled) setSlotsLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [form.doctorId, form.appointmentDate]);

  const handleChange = (e) => {
    if (["doctorId", "appointmentDate"].includes(e.target.name)) {
      setSlotInfo(null);
    }
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
      ...(["doctorId", "appointmentDate"].includes(e.target.name) ? { appointmentTime: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.doctorId || !form.appointmentDate || !form.appointmentTime) {
      setError("Please select a doctor, date, and time slot.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const bookedAppointment = await createAppointment({
        patientId: user.userId,
        doctorId: form.doctorId,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        reason: form.reason,
      });

      setBookingReceipt({
        tokenNumber: bookedAppointment.tokenNumber,
        doctor: doctors.find((doctor) => doctor.id === form.doctorId),
        date: bookedAppointment.appointmentDate,
        time: bookedAppointment.appointmentTime,
        patientsAhead: slotInfo?.bookedPatientCount || 0,
      });
      setMessage("Appointment booked successfully!");
      setForm({
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
      });
      setSlotInfo(null);
    } catch (err) {
      setError(err.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["PATIENT"]}>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Topbar />

          <div className="page-content">
            {/* Header */}
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1>Book Appointment</h1>
                <p>Select an attending practitioner and schedule your visit</p>
              </div>
              <button 
                onClick={() => router.push("/patient/my-appointments")} 
                className="btn btn-secondary"
              >
                <FaArrowLeft /> View Appointments
              </button>
            </div>

            {/* Form Card */}
            <div className="card fade-in" style={{ maxWidth: "700px", margin: "0 auto", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "linear-gradient(135deg, var(--blue), var(--cyan))", display: "flex", alignItems: "center", justifySpace: "center", justifyContent: "center", fontSize: "20px", color: "white" }}>
                  <FaCalendarAlt />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Consultation Details</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Please provide details to book your consultation</p>
                </div>
              </div>

              {message && (
                <div className="badge-green" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px", textTransform: "none" }}>
                  <FaCheckCircle style={{ fontSize: "16px" }} />
                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div className="badge-red" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px", textTransform: "none" }}>
                  <FaExclamationCircle style={{ fontSize: "16px" }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  
                  <div>
                    <label className="hms-label">Select Practitioner</label>
                    <div className="search-bar" style={{ padding: "10px 12px" }}>
                      <FaUserMd style={{ color: "var(--text-muted)" }} />
                      <select
                        name="doctorId"
                        value={form.doctorId}
                        onChange={handleChange}
                        className="hms-select"
                        style={{ border: "none", background: "none", padding: "0 4px", width: "100%", color: "var(--text-primary)" }}
                        required
                      >
                        <option value="">Choose Doctor...</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            Dr. {doctor.fullName} — {doctor.specialization || "General Medicine"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div>
                      <label className="hms-label">Appointment Date</label>
                      <div className="search-bar" style={{ padding: "10px 12px" }}>
                        <FaCalendarAlt style={{ color: "var(--text-muted)" }} />
                        <input
                          type="date"
                          name="appointmentDate"
                          value={form.appointmentDate}
                          onChange={handleChange}
                          style={{ border: "none", background: "none", outline: "none", width: "100%", color: "var(--text-primary)" }}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="hms-label">Time Slot</label>
                      <div className="search-bar" style={{ padding: "10px 12px" }}>
                        <FaClock style={{ color: "var(--text-muted)" }} />
                        <select
                          name="appointmentTime"
                          value={form.appointmentTime}
                          onChange={handleChange}
                          disabled={!form.doctorId || !form.appointmentDate || slotsLoading || !slotInfo?.available}
                          style={{ border: "none", background: "none", outline: "none", width: "100%", color: "var(--text-primary)" }}
                          required
                        >
                          <option value="">
                            {slotsLoading ? "Loading schedule..." : "Choose available time..."}
                          </option>
                          {slotInfo?.availableSlots?.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {form.doctorId && form.appointmentDate && !slotsLoading && slotInfo && (
                    <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 12 }}>
                      {!slotInfo.scheduleConfigured ? (
                        <span style={{ color: "var(--amber)" }}>This doctor has not published a schedule for the selected day.</span>
                      ) : !slotInfo.available ? (
                        <span style={{ color: "var(--rose)" }}>{slotInfo.reason ? `Doctor unavailable: ${slotInfo.reason}` : "Doctor is unavailable on this day."}</span>
                      ) : slotInfo.availableSlots.length === 0 ? (
                        <span style={{ color: "var(--rose)" }}>All consultation slots are already booked for this day.</span>
                      ) : (
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <span style={{ color: "var(--emerald)", fontWeight: 600 }}>{slotInfo.availableSlots.length} slots available</span>
                          <span style={{ color: "var(--text-secondary)" }}>{slotInfo.bookedPatientCount} patients already booked</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="hms-label">Reason for Visit</label>
                    <div className="search-bar" style={{ padding: "10px 12px" }}>
                      <FaCommentMedical style={{ color: "var(--text-muted)", marginTop: "2px", alignSelf: "flex-start" }} />
                      <textarea
                        name="reason"
                        value={form.reason}
                        onChange={handleChange}
                        placeholder="Describe your symptoms or reason for consulting..."
                        style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", width: "100%", fontFamily: "inherit", minHeight: "80px", resize: "none" }}
                        required
                      />
                    </div>
                  </div>

                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "20px", marginTop: "24px" }}>
                  <button 
                    type="button"
                    onClick={() => router.push("/patient/my-appointments")} 
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
                    {loading ? "Scheduling..." : "Schedule Appointment"}
                  </button>
                </div>
              </form>

            </div>

            {bookingReceipt && (
              <div className="card fade-in" style={{ maxWidth: 700, margin: "18px auto 0", border: "1px solid rgba(16,185,129,0.35)", textAlign: "center" }}>
                <FaCheckCircle style={{ color: "var(--emerald)", fontSize: 30, marginBottom: 8 }} />
                <h3 style={{ color: "var(--text-primary)", marginBottom: 6 }}>Booking Confirmed</h3>
                <div style={{ fontSize: 42, fontWeight: 800, color: "var(--cyan)", lineHeight: 1 }}>Token #{bookingReceipt.tokenNumber}</div>
                <p style={{ color: "var(--text-secondary)", marginTop: 10 }}>
                  Dr. {bookingReceipt.doctor?.fullName} · {bookingReceipt.date} at {bookingReceipt.time}
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 5 }}>
                  {bookingReceipt.patientsAhead} patient{bookingReceipt.patientsAhead === 1 ? "" : "s"} booked before you for this doctor on that day.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
