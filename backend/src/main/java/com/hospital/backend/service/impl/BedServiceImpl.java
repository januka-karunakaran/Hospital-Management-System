package com.hospital.backend.service.impl;

import com.hospital.backend.model.Bed;
import com.hospital.backend.model.BedBooking;
import com.hospital.backend.repository.BedBookingRepository;
import com.hospital.backend.repository.BedRepository;
import com.hospital.backend.service.BedService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BedServiceImpl implements BedService {

    private final BedRepository bedRepository;
    private final BedBookingRepository bedBookingRepository;

    @Override
    public Bed addBed(Bed bed) {
        if (bed.getStatus() == null) bed.setStatus("AVAILABLE");
        return bedRepository.save(bed);
    }

    @Override
    public List<Bed> getAllBeds() {
        return bedRepository.findAll();
    }

    @Override
    public Bed getBedById(String id) {
        return bedRepository.findById(id).orElseThrow(() -> new RuntimeException("Bed not found"));
    }

    @Override
    public Bed updateBed(String id, Bed bed) {
        Bed existing = getBedById(id);
        existing.setBedNumber(bed.getBedNumber());
        existing.setType(bed.getType());
        existing.setStatus(bed.getStatus());
        existing.setPricePerDay(bed.getPricePerDay());
        existing.setWard(bed.getWard());
        return bedRepository.save(existing);
    }

    @Override
    public void deleteBed(String id) {
        bedRepository.deleteById(id);
    }

    @Override
    public BedBooking bookBed(BedBooking booking) {
        Bed bed = getBedById(booking.getBedId());
        if (!"AVAILABLE".equals(bed.getStatus())) {
            throw new RuntimeException("Bed is not available");
        }
        
        bed.setStatus("OCCUPIED");
        bedRepository.save(bed);
        
        booking.setStatus("ACTIVE");
        if (booking.getAdmissionDate() == null) {
            booking.setAdmissionDate(LocalDate.now().toString());
        }
        
        return bedBookingRepository.save(booking);
    }

    @Override
    public List<BedBooking> getPatientBookings(String patientId) {
        return bedBookingRepository.findByPatientId(patientId);
    }

    @Override
    public BedBooking dischargePatient(String bookingId) {
        BedBooking booking = bedBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus("DISCHARGED");
        booking.setDischargeDate(LocalDate.now().toString());
        
        Bed bed = getBedById(booking.getBedId());
        bed.setStatus("AVAILABLE");
        bedRepository.save(bed);
        
        return bedBookingRepository.save(booking);
    }

    @Override
    public List<BedBooking> getAllBookings() {
        return bedBookingRepository.findAll();
    }
}
