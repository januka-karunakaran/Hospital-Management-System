package com.hospital.backend.service.impl;

import com.hospital.backend.dto.PatientRequest;
import com.hospital.backend.model.Patient;
import com.hospital.backend.repository.PatientRepository;
import com.hospital.backend.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    @Override
    public Patient createPatient(PatientRequest request) {
        Patient patient = Patient.builder()
            .userId(request.getUserId())
            .fullName(request.getFullName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .age(request.getAge())
            .gender(request.getGender())
            .bloodGroup(request.getBloodGroup())
            .address(request.getAddress())
            .build();

        return patientRepository.save(patient);
    }

    @Override
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @Override
    public Patient getPatientById(String id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    @Override
    public Patient updatePatient(String id, PatientRequest request) {
        Patient patient = getPatientById(id);

        patient.setFullName(request.getFullName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setAge(request.getAge());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAddress(request.getAddress());

        return patientRepository.save(patient);
    }

    @Override
    public void deletePatient(String id) {
        patientRepository.deleteById(id);
    }

    
    public Patient getMyProfile(String email) {
        return patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }
}