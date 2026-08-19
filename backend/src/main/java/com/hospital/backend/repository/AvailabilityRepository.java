package com.hospital.backend.repository;

import com.hospital.backend.model.Availability;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AvailabilityRepository extends MongoRepository<Availability, String> {
    List<Availability> findByDoctorId(String doctorId);
    List<Availability> findByDoctorIdAndDayOfWeek(String doctorId, String dayOfWeek);
    Optional<Availability> findByDoctorIdAndDate(String doctorId, String date);
}
