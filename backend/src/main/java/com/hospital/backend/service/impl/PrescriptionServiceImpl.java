package com.hospital.backend.service.impl;

import com.hospital.backend.dto.PrescriptionRequest;
import com.hospital.backend.exception.DuplicateResourceException;
import com.hospital.backend.exception.ResourceNotFoundException;
import com.hospital.backend.model.Appointment;
import com.hospital.backend.model.Doctor;
import com.hospital.backend.model.Patient;
import com.hospital.backend.model.Prescription;
import com.hospital.backend.repository.AppointmentRepository;
import com.hospital.backend.repository.DoctorRepository;
import com.hospital.backend.repository.PatientRepository;
import com.hospital.backend.repository.PrescriptionRepository;
import com.hospital.backend.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @Override
    public Prescription createPrescription(PrescriptionRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (!appointment.getDoctorId().equals(doctor.getUserId())) {
            throw new ResourceNotFoundException("Doctor does not match this appointment");
        }

        if (!appointment.getPatientId().equals(patient.getUserId())) {
            throw new ResourceNotFoundException("Patient does not match this appointment");
        }

        if (prescriptionRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new DuplicateResourceException("Prescription already exists for this appointment");
        }

        Prescription prescription = Prescription.builder()
                .appointmentId(request.getAppointmentId())
                .doctorId(request.getDoctorId())
                .patientId(request.getPatientId())
                .medicines(request.getMedicines())
                .notes(request.getNotes())
                .dosageInstructions(request.getDosageInstructions())
                .createdAt(LocalDateTime.now().toString())
                .build();

        return prescriptionRepository.save(prescription);
    }

    @Override
    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    @Override
    public Prescription getPrescriptionById(String id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));
    }

    @Override
    public List<Prescription> getPrescriptionsByDoctorId(String doctorId) {
        return prescriptionRepository.findByDoctorId(doctorId);
    }

    @Override
    public List<Prescription> getPrescriptionsByPatientId(String patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }

    @Override
    public List<Prescription> getPrescriptionsByAppointmentId(String appointmentId) {
        return prescriptionRepository.findByAppointmentId(appointmentId);
    }

    @Override
    public void deletePrescription(String id) {
        Prescription prescription = getPrescriptionById(id);
        prescriptionRepository.delete(prescription);
    }
}