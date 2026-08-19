package com.hospital.backend.service;

import com.hospital.backend.model.Bed;
import com.hospital.backend.model.BedBooking;
import java.util.List;

public interface BedService {
    Bed addBed(Bed bed);
    List<Bed> getAllBeds();
    Bed getBedById(String id);
    Bed updateBed(String id, Bed bed);
    void deleteBed(String id);
    
    BedBooking bookBed(BedBooking booking);
    List<BedBooking> getPatientBookings(String patientId);
    List<BedBooking> getAllBookings();
    BedBooking dischargePatient(String bookingId);
}
