package com.hospital.backend.repository;

import com.hospital.backend.model.Prescription;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PrescriptionRepository extends MongoRepository<Prescription, String> {
    List<Prescription> findByDoctorId(String doctorId);
    List<Prescription> findByPatientId(String patientId);
    List<Prescription> findByAppointmentId(String appointmentId);
    boolean existsByAppointmentId(String appointmentId);
    
    // Filter methods
    List<Prescription> findByMedicinesContainingIgnoreCase(String medicine);
    List<Prescription> findByDoctorIdAndPatientId(String doctorId, String patientId);
    List<Prescription> findByPatientIdAndDoctorId(String patientId, String doctorId);
}