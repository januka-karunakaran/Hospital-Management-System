/**
 * Search and Filter Service
 * API wrapper functions for doctor search, appointment filtering, and prescription filtering
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

// ==================== Doctor Search ====================

/**
 * Search doctors with multiple criteria
 * @param {Object} criteria - Search criteria (searchTerm, specialization, minRating, sortBy, sortOrder, limit, offset)
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Search results with pagination
 */
export async function searchDoctors(criteria, token) {
  if (!token) throw new Error("Authentication token required");

  const response = await fetch(`${API_BASE}/search/doctors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(criteria),
  });

  if (!response.ok) {
    throw new Error("Failed to search doctors");
  }

  return response.json();
}

/**
 * Search doctors by specialization
 * @param {string} specialization - Medical specialization (e.g., "Cardiology")
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Search results
 */
export async function searchDoctorsBySpecialization(specialization, token) {
  if (!token) throw new Error("Authentication token required");

  const response = await fetch(
    `${API_BASE}/search/doctors/specialization/${encodeURIComponent(specialization)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search doctors by specialization");
  }

  return response.json();
}

/**
 * Search doctors by name
 * @param {string} name - Doctor name or partial name
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Search results
 */
export async function searchDoctorsByName(name, token) {
  if (!token) throw new Error("Authentication token required");

  const response = await fetch(
    `${API_BASE}/search/doctors/name/${encodeURIComponent(name)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search doctors by name");
  }

  return response.json();
}

// ==================== Appointment Filtering ====================

/**
 * Filter appointments with multiple criteria
 * @param {Object} criteria - Filter criteria (status, startDate, endDate, doctorId, patientId, reason, sortBy, sortOrder, limit, offset)
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Filtered results with pagination
 */
export async function filterAppointments(criteria, token) {
  if (!token) throw new Error("Authentication token required");

  const response = await fetch(`${API_BASE}/search/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(criteria),
  });

  if (!response.ok) {
    throw new Error("Failed to filter appointments");
  }

  return response.json();
}

/**
 * Filter appointments by status
 * @param {string} status - Appointment status (PENDING, COMPLETED, CANCELLED)
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Filtered results
 */
export async function filterAppointmentsByStatus(status, token) {
  if (!token) throw new Error("Authentication token required");

  const response = await fetch(
    `${API_BASE}/search/appointments/status/${encodeURIComponent(status)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to filter appointments by status");
  }

  return response.json();
}

/**
 * Filter appointments by date range
 * @param {string} startDate - Start date (yyyy-MM-dd format)
 * @param {string} endDate - End date (yyyy-MM-dd format)
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Filtered results
 */
export async function filterAppointmentsByDateRange(startDate, endDate, token) {
  if (!token) throw new Error("Authentication token required");

  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  const response = await fetch(
    `${API_BASE}/search/appointments/date-range?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to filter appointments by date range");
  }

  return response.json();
}

// ==================== Prescription Filtering ====================

/**
 * Filter prescriptions with multiple criteria
 * @param {Object} criteria - Filter criteria (status, startDate, endDate, doctorId, patientId, medicine, sortBy, sortOrder, limit, offset)
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Filtered results with pagination
 */
export async function filterPrescriptions(criteria, token) {
  if (!token) throw new Error("Authentication token required");

  const response = await fetch(`${API_BASE}/search/prescriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(criteria),
  });

  if (!response.ok) {
    throw new Error("Failed to filter prescriptions");
  }

  return response.json();
}

/**
 * Filter prescriptions by doctor
 * @param {string} doctorId - Doctor ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Filtered results
 */
export async function filterPrescriptionsByDoctor(doctorId, token) {
  if (!token) throw new Error("Authentication token required");

  const response = await fetch(
    `${API_BASE}/search/prescriptions/doctor/${encodeURIComponent(doctorId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to filter prescriptions by doctor");
  }

  return response.json();
}

/**
 * Filter prescriptions by medicine name
 * @param {string} medicine - Medicine name or partial name
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Filtered results
 */
export async function filterPrescriptionsByMedicine(medicine, token) {
  if (!token) throw new Error("Authentication token required");

  const response = await fetch(
    `${API_BASE}/search/prescriptions/medicine/${encodeURIComponent(medicine)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to filter prescriptions by medicine");
  }

  return response.json();
}
