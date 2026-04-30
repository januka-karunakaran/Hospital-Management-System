package com.hospital.backend.service;

import com.hospital.backend.dto.PrescriptionRequest;
import com.hospital.backend.model.Prescription;

import java.util.List;

public interface PrescriptionService {
    Prescription createPrescription(PrescriptionRequest request);
    List<Prescription> getAllPrescriptions();
    Prescription getPrescriptionById(String id);
    List<Prescription> getPrescriptionsByDoctorId(String doctorId);
    List<Prescription> getPrescriptionsByPatientId(String patientId);
    List<Prescription> getPrescriptionsByAppointmentId(String appointmentId);
    void deletePrescription(String id);
}