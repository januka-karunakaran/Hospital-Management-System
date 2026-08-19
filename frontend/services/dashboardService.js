"use client";

import { apiFetch } from "./api";

export const getDashboardSummary = () => apiFetch("/dashboard/summary");
export const getDailyMetrics = (days = 7) => apiFetch(`/dashboard/daily-metrics?days=${days}`);
export const getAppointmentTrends = (days = 30) => apiFetch(`/dashboard/appointments/trends?days=${days}`);
export const getRevenueTrends = (days = 30) => apiFetch(`/dashboard/revenue/trends?days=${days}`);
export const getDiseaseTrends = () => apiFetch("/dashboard/disease-trends");
export const getTopDoctors = (limit = 5) => apiFetch(`/dashboard/top-doctors?limit=${limit}`);
export const getAppointmentStats = () => apiFetch("/dashboard/appointments");
export const getUserStats = () => apiFetch("/dashboard/users");
export const getRevenueStats = () => apiFetch("/dashboard/revenue");
export const getCompletionRate = () => apiFetch("/dashboard/completion-rate");
export const getDoctorPerformance = (doctorId) => apiFetch(`/dashboard/doctors/${doctorId}/performance`);
export const getDoctorAppointmentStats = (doctorId) => apiFetch(`/dashboard/doctors/${doctorId}/appointments`);
