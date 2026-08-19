"use client";

import { apiFetch } from "./api";

export const getAllBeds = () => apiFetch("/beds");
export const getBedById = (id) => apiFetch(`/beds/${id}`);
export const createBed = (data) => apiFetch("/beds", { method: "POST", body: JSON.stringify(data) });
export const updateBedStatus = (id, status) => apiFetch(`/beds/${id}/status?status=${status}`, { method: "PUT" });
export const deleteBed = (id) => apiFetch(`/beds/${id}`, { method: "DELETE" });
export const assignBed = (data) => apiFetch("/beds/assign", { method: "POST", body: JSON.stringify(data) });
export const releaseBed = (bookingId) => apiFetch(`/beds/release/${bookingId}`, { method: "PUT" });
export const getAvailableBeds = () => apiFetch("/beds/available");
export const getBedBookings = () => apiFetch("/beds/bookings");
