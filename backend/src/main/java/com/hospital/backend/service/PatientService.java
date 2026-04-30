package com.hospital.backend.service;

import com.hospital.backend.dto.PatientRequest;
import com.hospital.backend.model.Patient;

import java.util.List;

public interface PatientService {
    Patient createPatient(PatientRequest request);
    List<Patient> getAllPatients();
    Patient getPatientById(String id);
    Patient updatePatient(String id, PatientRequest request);
    void deletePatient(String id);
    Patient getMyProfile(String email);
}