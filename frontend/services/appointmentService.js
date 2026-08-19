"use client";

import { apiFetch } from "./api";

export const getAllDoctors = () => apiFetch("/doctors");
export const getAllPatients = () => apiFetch("/patients");

export const createAppointment = (data) =>
  apiFetch("/appointments", { method: "POST", body: JSON.stringify(data) });

export const getDoctorAppointments = (doctorId) =>
  apiFetch(`/appointments/doctor/${doctorId}`);

export const getPatientAppointments = (patientId) =>
  apiFetch(`/appointments/patient/${patientId}`);

export const updateAppointmentStatus = (appointmentId, status) =>
  apiFetch(`/appointments/${appointmentId}/status?status=${status}`, { method: "PUT" });

export const cancelAppointment = (appointmentId) =>
  updateAppointmentStatus(appointmentId, "CANCELLED");

export const completeAppointment = (appointmentId) =>
  updateAppointmentStatus(appointmentId, "COMPLETED");

export const confirmAppointment = (appointmentId) =>
  updateAppointmentStatus(appointmentId, "CONFIRMED");

export const deleteAppointment = (id) =>
  apiFetch(`/appointments/${id}`, { method: "DELETE" });

export const getAppointmentById = (id) => apiFetch(`/appointments/${id}`);

export const getDoctorAvailability = (doctorId) =>
  apiFetch(`/availability/doctor/${doctorId}`);

export const getAvailableSlots = (doctorId, date) =>
  apiFetch(`/availability/doctor/${doctorId}/date/${date}`);
