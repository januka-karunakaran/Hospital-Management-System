import { apiFetch } from "./api";

export async function getReminders(patientId) {
  return apiFetch(`/reminders/patient/${patientId}`);
}

export async function addReminder(reminderData) {
  return apiFetch("/reminders", {
    method: "POST",
    body: JSON.stringify(reminderData),
  });
}

export async function toggleReminder(id) {
  return apiFetch(`/reminders/${id}/toggle`, {
    method: "POST",
  });
}

export async function deleteReminder(id) {
  return apiFetch(`/reminders/${id}`, {
    method: "DELETE",
  });
}
