package com.hospital.backend.controller;

import com.hospital.backend.model.Bed;
import com.hospital.backend.model.BedBooking;
import com.hospital.backend.service.BedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beds")
@RequiredArgsConstructor
public class BedController {

    private final BedService bedService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Bed> addBed(@RequestBody Bed bed) {
        return ResponseEntity.ok(bedService.addBed(bed));
    }

    @GetMapping
    public ResponseEntity<List<Bed>> getAllBeds() {
        return ResponseEntity.ok(bedService.getAllBeds());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Bed> updateBed(@PathVariable String id, @RequestBody Bed bed) {
        return ResponseEntity.ok(bedService.updateBed(id, bed));
    }

    @PostMapping("/book")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<BedBooking> bookBed(@RequestBody BedBooking booking) {
        return ResponseEntity.ok(bedService.bookBed(booking));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<BedBooking>> getPatientBookings(@PathVariable String patientId) {
        return ResponseEntity.ok(bedService.getPatientBookings(patientId));
    }

    @PostMapping("/discharge/{bookingId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<BedBooking> dischargePatient(@PathVariable String bookingId) {
        return ResponseEntity.ok(bedService.dischargePatient(bookingId));
    }

    @GetMapping("/bookings")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<List<BedBooking>> getAllBookings() {
        return ResponseEntity.ok(bedService.getAllBookings());
    }
}
