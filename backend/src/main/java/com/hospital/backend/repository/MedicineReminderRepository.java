package com.hospital.backend.repository;

import com.hospital.backend.model.MedicineReminder;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MedicineReminderRepository extends MongoRepository<MedicineReminder, String> {
    List<MedicineReminder> findByPatientId(String patientId);
    List<MedicineReminder> findByIsActiveTrue();
}
