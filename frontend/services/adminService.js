"use client";

import { apiFetch } from "./api";

// Doctors
export const getDoctors = () => apiFetch("/doctors");
export const getDoctorById = (id) => apiFetch(`/doctors/${id}`);
export const createDoctor = (data) => apiFetch("/doctors", { method: "POST", body: JSON.stringify(data) });
export const updateDoctor = (id, data) => apiFetch(`/doctors/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteDoctor = (id) => apiFetch(`/doctors/${id}`, { method: "DELETE" });

// Patients
export const getPatients = () => apiFetch("/patients");
export const getPatientById = (id) => apiFetch(`/patients/${id}`);
export const createPatient = (data) => apiFetch("/patients", { method: "POST", body: JSON.stringify(data) });
export const updatePatient = (id, data) => apiFetch(`/patients/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePatient = (id) => apiFetch(`/patients/${id}`, { method: "DELETE" });

// Appointments
export const getAppointments = () => apiFetch("/appointments");
export const getAppointmentById = (id) => apiFetch(`/appointments/${id}`);
export const updateAppointmentStatus = (id, status) => apiFetch(`/appointments/${id}/status?status=${status}`, { method: "PUT" });
export const deleteAppointment = (id) => apiFetch(`/appointments/${id}`, { method: "DELETE" });

// Prescriptions
export const getPrescriptions = () => apiFetch("/prescriptions");
export const getPrescriptionById = (id) => apiFetch(`/prescriptions/${id}`);

// Beds
export const getBeds = () => apiFetch("/beds");
export const createBed = (data) => apiFetch("/beds", { method: "POST", body: JSON.stringify(data) });
export const updateBed = (id, data) => apiFetch(`/beds/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteBed = (id) => apiFetch(`/beds/${id}`, { method: "DELETE" });
export const getBedStats = () => apiFetch("/beds/stats");
export const assignBed = (data) => apiFetch("/beds/assign", { method: "POST", body: JSON.stringify(data) });
export const releaseBed = (bookingId) => apiFetch(`/beds/release/${bookingId}`, { method: "PUT" });

// Invoices / Billing
export const getInvoices = () => apiFetch("/invoices");
export const getInvoiceById = (id) => apiFetch(`/invoices/${id}`);
export const createInvoice = (data) => apiFetch("/invoices", { method: "POST", body: JSON.stringify(data) });
export const updateInvoice = (id, data) => apiFetch(`/invoices/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteInvoice = (id) => apiFetch(`/invoices/${id}`, { method: "DELETE" });

// Admin stats
export const getAdminStats = () => apiFetch("/admin/stats");