"use client";

import { apiFetch } from "./api";

// Patient dashboard summary
export const getPatientDashboardSummary = () => apiFetch("/patient/dashboard/summary");

// Patient health stats
export const getPatientHealthStats = () => apiFetch("/patient/dashboard/health-stats");

// Upcoming appointments
export const getUpcomingAppointments = (limit = 5) => apiFetch(`/patient/dashboard/appointments/upcoming?limit=${limit}`);

// Past appointments
export const getPastAppointments = (limit = 5) => apiFetch(`/patient/dashboard/appointments/past?limit=${limit}`);

// All appointments
export const getAllAppointments = () => apiFetch("/patient/dashboard/appointments/all");

// Active prescriptions
export const getActivePrescriptions = () => apiFetch("/patient/dashboard/prescriptions/active");

// Recent prescriptions
export const getRecentPrescriptions = (limit = 5) => apiFetch(`/patient/dashboard/prescriptions/recent?limit=${limit}`);

// Next appointment
export const getNextAppointment = () => apiFetch("/patient/dashboard/appointments/next");

// Appointment history (for charts)
export const getAppointmentHistory = (days = 30) => apiFetch(`/patient/dashboard/appointments/history?days=${days}`);

// Appointment count by status
export const getAppointmentCount = (status) => apiFetch(`/patient/dashboard/appointments/count?status=${status}`);

// Completion rate
export const getCompletionRate = () => apiFetch("/patient/dashboard/completion-rate");

// Prescription timeline
export const getPrescriptionTimeline = () => apiFetch("/patient/dashboard/prescriptions/timeline");

// Medical history
export const getMedicalHistory = (patientId) => apiFetch(`/patients/${patientId}/history`);

// Family members
export const getFamilyMembers = (patientId) => apiFetch(`/patients/${patientId}/family`);
export const addFamilyMember = (patientId, memberData) =>
  apiFetch(`/patients/${patientId}/family`, { method: "POST", body: JSON.stringify(memberData) });
