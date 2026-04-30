package com.hospital.backend.service.impl;

import com.hospital.backend.dto.DoctorRequest;
import com.hospital.backend.model.Doctor;
import com.hospital.backend.repository.DoctorRepository;
import com.hospital.backend.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;

    @Override
    public Doctor createDoctor(DoctorRequest request) {
        Doctor doctor = Doctor.builder()
            .userId(request.getUserId())
            .fullName(request.getFullName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .specialization(request.getSpecialization())
            .experienceYears(request.getExperienceYears())
            .availableDays(request.getAvailableDays())
            .status("ACTIVE")
            .build();

        return doctorRepository.save(doctor);
    }

    @Override
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @Override
    public Doctor getDoctorById(String id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    @Override
    public Doctor updateDoctor(String id, DoctorRequest request) {
        Doctor doctor = getDoctorById(id);

        doctor.setFullName(request.getFullName());
        doctor.setEmail(request.getEmail());
        doctor.setPhone(request.getPhone());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setAvailableDays(request.getAvailableDays());
        doctor.setStatus(request.getStatus());

        return doctorRepository.save(doctor);
    }

    @Override
    public void deleteDoctor(String id) {
        doctorRepository.deleteById(id);
    }

    public Doctor getMyProfile(String email) {
    return doctorRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Doctor not found"));
}
}