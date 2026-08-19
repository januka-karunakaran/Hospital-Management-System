"use client";

import { apiFetch } from "./api";

export const getAllPrescriptions = () => apiFetch("/prescriptions");
export const getPrescriptionById = (id) => apiFetch(`/prescriptions/${id}`);

export const getPrescriptionsByDoctor = (doctorId) =>
  apiFetch(`/prescriptions/doctor/${doctorId}`);

export const getPrescriptionsByPatient = (patientId) =>
  apiFetch(`/prescriptions/patient/${patientId}`);

export const createPrescription = (data) =>
  apiFetch("/prescriptions", { method: "POST", body: JSON.stringify(data) });

export const updatePrescription = (id, data) =>
  apiFetch(`/prescriptions/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deletePrescription = (id) =>
  apiFetch(`/prescriptions/${id}`, { method: "DELETE" });

export const downloadPrescriptionPdf = async (prescriptionId) => {
  const { getAccessToken } = await import("@/utils/auth");
  const { API_BASE } = await import("@/utils/constants");
  const token = getAccessToken();
  const response = await fetch(`${API_BASE}/prescriptions/${prescriptionId}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to download PDF");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prescription-${prescriptionId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};