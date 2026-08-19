package com.hospital.backend.service;

import com.hospital.backend.dto.DoctorAvailabilityDTO;
import com.hospital.backend.dto.AvailableSlotsResponse;
import java.util.List;

public interface AvailabilityService {
    DoctorAvailabilityDTO setAvailability(DoctorAvailabilityDTO dto);
    List<DoctorAvailabilityDTO> getDoctorAvailability(String doctorId);
    AvailableSlotsResponse getAvailableSlots(String doctorId, String date);
    void deleteAvailability(String id);
}
