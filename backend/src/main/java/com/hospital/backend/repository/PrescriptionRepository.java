package com.hospital.backend.repository;

import com.hospital.backend.model.Prescription;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PrescriptionRepository extends MongoRepository<Prescription, String> {
    List<Prescription> findByDoctorId(String doctorId);
    List<Prescription> findByPatientId(String patientId);
    List<Prescription> findByAppointmentId(String appointmentId);
    boolean existsByAppointmentId(String appointmentId);
}