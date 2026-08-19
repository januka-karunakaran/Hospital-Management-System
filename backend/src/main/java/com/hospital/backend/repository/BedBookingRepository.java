package com.hospital.backend.repository;

import com.hospital.backend.model.BedBooking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BedBookingRepository extends MongoRepository<BedBooking, String> {
    List<BedBooking> findByPatientId(String patientId);
    List<BedBooking> findByStatus(String status);
}
