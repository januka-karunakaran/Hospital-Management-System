package com.hospital.backend.service;

import com.hospital.backend.dto.DoctorRequest;
import com.hospital.backend.model.Doctor;

import java.util.List;

public interface DoctorService {
    Doctor createDoctor(DoctorRequest request);
    List<Doctor> getAllDoctors();
    Doctor getDoctorById(String id);
    Doctor updateDoctor(String id, DoctorRequest request);
    void deleteDoctor(String id);
    Doctor getMyProfile(String email);
}