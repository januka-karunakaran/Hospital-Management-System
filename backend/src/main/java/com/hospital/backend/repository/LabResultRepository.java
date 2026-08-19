package com.hospital.backend.repository;

import com.hospital.backend.model.LabResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface LabResultRepository extends MongoRepository<LabResult, String> {
    List<LabResult> findByPatientId(String patientId);
    List<LabResult> findByDoctorId(String doctorId);
    List<LabResult> findByAppointmentId(String appointmentId);
}
