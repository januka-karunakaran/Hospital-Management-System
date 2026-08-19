package com.hospital.backend.controller;

import com.hospital.backend.dto.DoctorAvailabilityDTO;
import com.hospital.backend.dto.AvailableSlotsResponse;
import com.hospital.backend.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorAvailabilityDTO> setAvailability(@RequestBody DoctorAvailabilityDTO dto) {
        return ResponseEntity.ok(availabilityService.setAvailability(dto));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorAvailabilityDTO>> getDoctorAvailability(@PathVariable String doctorId) {
        return ResponseEntity.ok(availabilityService.getDoctorAvailability(doctorId));
    }

    @GetMapping("/doctor/{doctorId}/date/{date}")
    public ResponseEntity<AvailableSlotsResponse> getAvailableSlots(
            @PathVariable String doctorId,
            @PathVariable String date) {
        return ResponseEntity.ok(availabilityService.getAvailableSlots(doctorId, date));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<String> deleteAvailability(@PathVariable String id) {
        availabilityService.deleteAvailability(id);
        return ResponseEntity.ok("Availability deleted");
    }
}
