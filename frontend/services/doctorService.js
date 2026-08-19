import { apiFetch } from "./api";

export async function setAvailability(availabilityData) {
  return apiFetch("/availability", {
    method: "POST",
    body: JSON.stringify(availabilityData),
  });
}

export async function getDoctorAvailability(doctorId) {
  return apiFetch(`/availability/doctor/${doctorId}`);
}

export async function deleteAvailability(id) {
  return apiFetch(`/availability/${id}`, {
    method: "DELETE",
  });
}
