package com.hospital.backend.service.impl;

import com.hospital.backend.dto.DoctorRequest;
import com.hospital.backend.model.Doctor;
import com.hospital.backend.model.User;
import com.hospital.backend.enums.Role;
import com.hospital.backend.repository.DoctorRepository;
import com.hospital.backend.repository.UserRepository;
import com.hospital.backend.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

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
        List<Doctor> doctorProfiles = doctorRepository.findAll();

        // Older doctor signups created a User account but no Doctor document.
        // Backfill those profiles so the booking directory reflects the actual
        // DOCTOR users already stored in MongoDB.
        for (User doctorUser : userRepository.findByRole(Role.DOCTOR)) {
            Doctor existingProfile = doctorProfiles.stream().filter(profile ->
                    doctorUser.getId().equals(profile.getId())
                            || doctorUser.getId().equals(profile.getUserId())
                            || doctorUser.getEmail().equalsIgnoreCase(profile.getEmail()))
                    .findFirst()
                    .orElse(null);

            if (existingProfile == null) {
                Doctor profile = Doctor.builder()
                        .id(doctorUser.getId())
                        .userId(doctorUser.getId())
                        .fullName(doctorUser.getFullName())
                        .email(doctorUser.getEmail())
                        .phone(doctorUser.getPhoneNumber())
                        .specialization(doctorUser.getSpecialization() != null
                                ? doctorUser.getSpecialization()
                                : "General Medicine")
                        .status("ACTIVE")
                        .build();
                doctorProfiles.add(doctorRepository.save(profile));
            } else if (existingProfile.getUserId() == null || existingProfile.getUserId().isBlank()) {
                existingProfile.setUserId(doctorUser.getId());
                doctorRepository.save(existingProfile);
            }
        }

        doctorProfiles.sort(Comparator.comparing(
                Doctor::getFullName,
                Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));
        return doctorProfiles;
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
