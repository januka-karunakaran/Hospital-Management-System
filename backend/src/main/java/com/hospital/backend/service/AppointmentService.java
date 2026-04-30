package com.hospital.backend.service;

import com.hospital.backend.dto.AppointmentRequest;
import com.hospital.backend.model.Appointment;

import java.util.List;

public interface AppointmentService {
    Appointment createAppointment(AppointmentRequest request);
    List<Appointment> getAllAppointments();
    Appointment getAppointmentById(String id);
    List<Appointment> getAppointmentsByDoctorId(String doctorId);
    List<Appointment> getAppointmentsByPatientId(String patientId);
    List<Appointment> getMyAppointments(String patientId);
    Appointment updateAppointmentStatus(String id, String status);
    void deleteAppointment(String id);
}