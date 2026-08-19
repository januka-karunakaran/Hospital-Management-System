package com.hospital.backend.repository;

import com.hospital.backend.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    List<Appointment> findByDoctorId(String doctorId);
    List<Appointment> findByPatientId(String patientId);
    List<Appointment> findByDoctorIdAndAppointmentDate(String doctorId, String appointmentDate);
    
    // Filter methods
    List<Appointment> findByStatus(String status);
    List<Appointment> findByDoctorIdAndStatus(String doctorId, String status);
    List<Appointment> findByPatientIdAndStatus(String patientId, String status);
    List<Appointment> findByReasonContainingIgnoreCase(String reason);
}
