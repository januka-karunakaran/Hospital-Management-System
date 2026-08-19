"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import SilentLogin from "@/app/components/SilentLogin";
import { apiFetch } from "@/services/api";
import { getPatients, getDoctors } from "@/services/adminService";
import { 
  FaBed, FaUserCheck, FaSignOutAlt, FaPlus, FaTools, 
  FaCheckCircle, FaExclamationCircle, FaUser, FaUserMd, 
  FaInfoCircle, FaCalendarAlt, FaDollarSign, FaHotel 
} from "react-icons/fa";

export default function BedManagementPage() {
  const [beds, setBeds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedBedForAllocation, setSelectedBedForAllocation] = useState(null);

  // Form States
  const [newBed, setNewBed] = useState({
    bedNumber: "",
    type: "GENERAL",
    pricePerDay: 500,
    ward: "General Ward"
  });

  const [allocationForm, setAllocationForm] = useState({
    patientId: "",
    doctorId: "",
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [bedsData, bookingsData, patientsData, doctorsData] = await Promise.all([
        apiFetch("/beds"),
        apiFetch("/beds/bookings"),
        getPatients(),
        getDoctors()
      ]);
      setBeds(bedsData);
      setBookings(bookingsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (err) {
      setError(err.message || "Failed to load bed management data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBed = async (e) => {
    e.preventDefault();
    if (!newBed.bedNumber || !newBed.ward) {
      setError("Please fill out all bed fields.");
      return;
    }
    try {
      setError("");
      setSuccess("");
      await apiFetch("/beds", {
        method: "POST",
        body: JSON.stringify({
          ...newBed,
          pricePerDay: Number(newBed.pricePerDay || 0)
        })
      });
      setSuccess(`Bed ${newBed.bedNumber} added successfully.`);
      setShowAddModal(false);
      setNewBed({ bedNumber: "", type: "GENERAL", pricePerDay: 500, ward: "General Ward" });
      loadData();
    } catch (err) {
      setError(err.message || "Failed to add bed.");
    }
  };

  const handleAllocateBed = async (e) => {
    e.preventDefault();
    if (!allocationForm.patientId || !allocationForm.doctorId) {
      setError("Please select a patient and a doctor.");
      return;
    }
    try {
      setError("");
      setSuccess("");
      await apiFetch("/beds/book", {
        method: "POST",
        body: JSON.stringify({
          bedId: selectedBedForAllocation.id,
          patientId: allocationForm.patientId,
          doctorId: allocationForm.doctorId,
          notes: allocationForm.notes
        })
      });
      setSuccess(`Bed ${selectedBedForAllocation.bedNumber} allocated successfully.`);
      setShowAllocateModal(false);
      setAllocationForm({ patientId: "", doctorId: "", notes: "" });
      loadData();
    } catch (err) {
      setError(err.message || "Failed to allocate bed.");
    }
  };

  const handleDischarge = async (bed) => {
    // Find the active booking for this bed
    const activeBooking = bookings.find(b => b.bedId === bed.id && b.status === "ACTIVE");
    if (!activeBooking) {
      setError(`No active booking found for bed ${bed.bedNumber}.`);
      return;
    }

    if (!confirm(`Are you sure you want to discharge the patient from Bed ${bed.bedNumber}?`)) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await apiFetch(`/beds/discharge/${activeBooking.id}`, { method: "POST" });
      setSuccess(`Discharged successfully from Bed ${bed.bedNumber}.`);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to discharge patient.");
    }
  };

  const handleToggleMaintenance = async (bed) => {
    const newStatus = bed.status === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";
    try {
      setError("");
      setSuccess("");
      await apiFetch(`/beds/${bed.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...bed,
          status: newStatus
        })
      });
      setSuccess(`Bed ${bed.bedNumber} is now ${newStatus.toLowerCase()}.`);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to update bed status.");
    }
  };

  // Helpers to get Patient and Doctor details
  const getBookingDetails = (bedId) => {
    const booking = bookings.find(b => b.bedId === bedId && b.status === "ACTIVE");
    if (!booking) return null;

    const patient = patients.find(p => p.id === booking.patientId);
    const doctor = doctors.find(d => d.id === booking.doctorId);

    return {
      booking,
      patientName: patient ? patient.fullName : "Unknown Patient",
      doctorName: doctor ? `Dr. ${doctor.fullName}` : "Unknown Doctor",
      admissionDate: booking.admissionDate ? new Date(booking.admissionDate).toLocaleDateString() : "N/A"
    };
  };

  // Filter logic
  const filteredBeds = beds.filter(bed => {
    const matchesSearch = 
      bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.ward.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || bed.status === statusFilter;
    const matchesType = typeFilter === "ALL" || bed.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0a0e1a] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <SilentLogin />
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Topbar />

          <div className="page-content">
            {/* Header */}
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1>Bed Allocation & Wards</h1>
                <p>Monitor patient bed occupancy, allocate units, and update ward maintenance</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <FaPlus /> Add New Bed
              </button>
            </div>

            {/* Error & Success Badges */}
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

            {/* KPIs */}
            <div className="grid-4">
              <div className="kpi-card" style={{ "--kpi-color": "linear-gradient(90deg, #3b82f6, #06b6d4)" }}>
                <div className="kpi-label">Total Beds</div>
                <div className="kpi-value">{beds.length}</div>
                <div className="kpi-sub">Total registered capacity</div>
              </div>
              <div className="kpi-card" style={{ "--kpi-color": "linear-gradient(90deg, #10b981, #34d399)" }}>
                <div className="kpi-label" style={{ color: "#34d399" }}>Available</div>
                <div className="kpi-value" style={{ color: "#34d399" }}>{beds.filter(b => b.status === "AVAILABLE").length}</div>
                <div className="kpi-sub">Ready for admissions</div>
              </div>
              <div className="kpi-card" style={{ "--kpi-color": "linear-gradient(90deg, #f43f5e, #fb7185)" }}>
                <div className="kpi-label" style={{ color: "#fb7185" }}>Occupied</div>
                <div className="kpi-value" style={{ color: "#fb7185" }}>{beds.filter(b => b.status === "OCCUPIED").length}</div>
                <div className="kpi-sub">Currently admitted patients</div>
              </div>
              <div className="kpi-card" style={{ "--kpi-color": "linear-gradient(90deg, #f59e0b, #fbbf24)" }}>
                <div className="kpi-label" style={{ color: "#fbbf24" }}>Maintenance</div>
                <div className="kpi-value" style={{ color: "#fbbf24" }}>{beds.filter(b => b.status === "MAINTENANCE").length}</div>
                <div className="kpi-sub">Out of service units</div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                <div className="search-bar" style={{ minWidth: "260px", flex: 1 }}>
                  <FaBed style={{ color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    placeholder="Search by Bed Number or Ward..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {/* Status Filters */}
                  <button 
                    onClick={() => setStatusFilter("ALL")} 
                    className={`btn btn-sm ${statusFilter === "ALL" ? "btn-primary" : "btn-secondary"}`}
                  >
                    All Status
                  </button>
                  <button 
                    onClick={() => setStatusFilter("AVAILABLE")} 
                    className={`btn btn-sm ${statusFilter === "AVAILABLE" ? "btn-success" : "btn-secondary"}`}
                  >
                    Available
                  </button>
                  <button 
                    onClick={() => setStatusFilter("OCCUPIED")} 
                    className={`btn btn-sm ${statusFilter === "OCCUPIED" ? "btn-danger" : "btn-secondary"}`}
                  >
                    Occupied
                  </button>
                  <button 
                    onClick={() => setStatusFilter("MAINTENANCE")} 
                    className={`btn btn-sm ${statusFilter === "MAINTENANCE" ? "btn-warning" : "btn-secondary"}`}
                  >
                    Maintenance
                  </button>

                  <div style={{ borderLeft: "1px solid var(--border)", margin: "0 4px" }} />

                  {/* Type filter */}
                  <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="hms-select"
                    style={{ width: "130px", padding: "5px 10px", fontSize: "12px" }}
                  >
                    <option value="ALL">All Types</option>
                    <option value="GENERAL">General</option>
                    <option value="ICU">ICU</option>
                    <option value="SEMI_PRIVATE">Semi Private</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bed Cards Grid */}
            <div className="grid-4" style={{ marginTop: "8px" }}>
              {filteredBeds.length === 0 ? (
                <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
                  <FaBed style={{ fontSize: "32px", color: "var(--text-muted)", marginBottom: "8px" }} />
                  <p style={{ color: "var(--text-secondary)" }}>No beds matching current search criteria.</p>
                </div>
              ) : (
                filteredBeds.map((bed) => {
                  const details = getBookingDetails(bed.id);
                  return (
                    <div key={bed.id} className="card fade-in" style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: `4px solid ${
                      bed.status === "AVAILABLE" ? "#10b981" : 
                      bed.status === "OCCUPIED" ? "#f43f5e" : "#f59e0b"
                    }` }}>
                      {/* Bed Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h3 style={{ fontSize: "18px", fontWeight: "800", color: "white" }}>Bed {bed.bedNumber}</h3>
                          <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" }}>{bed.ward}</span>
                        </div>
                        <span className={`badge ${
                          bed.status === "AVAILABLE" ? "badge-green" : 
                          bed.status === "OCCUPIED" ? "badge-red" : "badge-yellow"
                        }`}>
                          {bed.status}
                        </span>
                      </div>

                      {/* Info lines */}
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Type:</span>
                          <strong style={{ color: "var(--text-primary)" }}>{bed.type}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Price/Day:</span>
                          <strong style={{ color: "var(--emerald)" }}>${bed.pricePerDay}</strong>
                        </div>
                      </div>

                      {/* Active Patient Details (if occupied) */}
                      {bed.status === "OCCUPIED" && details && (
                        <div style={{ background: "var(--surface-2)", borderRadius: "8px", padding: "10px", fontSize: "12px", border: "1px solid var(--border)", marginTop: "4px" }}>
                          <div style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>Current Occupant</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", color: "var(--text-primary)", fontWeight: "600" }}>
                            <FaUser style={{ fontSize: "10px", color: "var(--cyan)" }} />
                            <span>{details.patientName}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <FaUserMd style={{ fontSize: "10px", color: "var(--blue)" }} />
                            <span>{details.doctorName}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "11px" }}>
                            <FaCalendarAlt style={{ fontSize: "10px" }} />
                            <span>Admitted: {details.admissionDate}</span>
                          </div>
                          {details.booking.notes && (
                            <div style={{ marginTop: "6px", borderTop: "1px solid var(--border)", paddingTop: "4px", fontStyle: "italic", fontSize: "11px", color: "var(--text-muted)" }}>
                              "{details.booking.notes}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "8px", marginTop: "auto", pt: "8px", borderTop: "1px solid var(--border)" }}>
                        {bed.status === "AVAILABLE" && (
                          <>
                            <button 
                              onClick={() => {
                                setSelectedBedForAllocation(bed);
                                setShowAllocateModal(true);
                              }}
                              className="btn btn-sm btn-success" 
                              style={{ flex: 1, justifyContent: "center" }}
                            >
                              <FaUserCheck /> Allocate
                            </button>
                            <button 
                              onClick={() => handleToggleMaintenance(bed)}
                              className="btn btn-sm btn-secondary"
                              title="Set to Maintenance"
                            >
                              <FaTools />
                            </button>
                          </>
                        )}
                        {bed.status === "OCCUPIED" && (
                          <button 
                            onClick={() => handleDischarge(bed)}
                            className="btn btn-sm btn-danger" 
                            style={{ flex: 1, justifyContent: "center" }}
                          >
                            <FaSignOutAlt /> Discharge
                          </button>
                        )}
                        {bed.status === "MAINTENANCE" && (
                          <button 
                            onClick={() => handleToggleMaintenance(bed)}
                            className="btn btn-sm btn-success" 
                            style={{ flex: 1, justifyContent: "center" }}
                          >
                            <FaTools /> Restore Bed
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Bed Modal */}
            {showAddModal && (
              <div className="modal-overlay">
                <div className="modal fade-in">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                    <h2 className="modal-title" style={{ margin: 0 }}>Add New Unit</h2>
                    <FaBed style={{ color: "var(--cyan)" }} />
                  </div>
                  <form onSubmit={handleAddBed}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div>
                        <label className="hms-label">Bed Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 104-A"
                          value={newBed.bedNumber}
                          onChange={(e) => setNewBed({...newBed, bedNumber: e.target.value})}
                          className="hms-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="hms-label">Ward / Location</label>
                        <input 
                          type="text" 
                          placeholder="e.g. ICU Ward A"
                          value={newBed.ward}
                          onChange={(e) => setNewBed({...newBed, ward: e.target.value})}
                          className="hms-input"
                          required
                        />
                      </div>
                      <div className="grid-2">
                        <div>
                          <label className="hms-label">Type</label>
                          <select 
                            value={newBed.type}
                            onChange={(e) => setNewBed({...newBed, type: e.target.value})}
                            className="hms-select"
                          >
                            <option value="GENERAL">GENERAL</option>
                            <option value="ICU">ICU</option>
                            <option value="SEMI_PRIVATE">SEMI_PRIVATE</option>
                            <option value="PRIVATE">PRIVATE</option>
                          </select>
                        </div>
                        <div>
                          <label className="hms-label">Price per Day ($)</label>
                          <input 
                            type="number" 
                            placeholder="500"
                            value={newBed.pricePerDay}
                            onChange={(e) => setNewBed({...newBed, pricePerDay: e.target.value})}
                            className="hms-input"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
                      <button 
                        type="button" 
                        onClick={() => setShowAddModal(false)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                      >
                        Add Bed
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Allocate Bed Modal */}
            {showAllocateModal && selectedBedForAllocation && (
              <div className="modal-overlay">
                <div className="modal fade-in">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                    <h2 className="modal-title" style={{ margin: 0 }}>Allocate Bed {selectedBedForAllocation.bedNumber}</h2>
                    <FaUserCheck style={{ color: "var(--emerald)" }} />
                  </div>
                  <form onSubmit={handleAllocateBed}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div>
                        <label className="hms-label">Select Patient</label>
                        <select
                          value={allocationForm.patientId}
                          onChange={(e) => setAllocationForm({...allocationForm, patientId: e.target.value})}
                          className="hms-select"
                          required
                        >
                          <option value="">-- Choose Patient --</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.fullName} ({p.email})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="hms-label">Attending Doctor</label>
                        <select
                          value={allocationForm.doctorId}
                          onChange={(e) => setAllocationForm({...allocationForm, doctorId: e.target.value})}
                          className="hms-select"
                          required
                        >
                          <option value="">-- Choose Doctor --</option>
                          {doctors.map(d => (
                            <option key={d.id} value={d.id}>Dr. {d.fullName} ({d.specialization})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="hms-label">Admission Notes</label>
                        <textarea
                          placeholder="Reason for ward admission, conditions, etc..."
                          value={allocationForm.notes}
                          onChange={(e) => setAllocationForm({...allocationForm, notes: e.target.value})}
                          style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "9px", padding: "10px", color: "white", minHeight: "80px", resize: "none", outline: "none", fontSize: "13px" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowAllocateModal(false);
                          setAllocationForm({ patientId: "", doctorId: "", notes: "" });
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                      >
                        Allocate Unit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
