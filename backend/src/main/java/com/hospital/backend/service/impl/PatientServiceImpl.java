package com.hospital.backend.service.impl;

import com.hospital.backend.dto.MedicalRecordDTO;
import com.hospital.backend.dto.PatientRequest;
import com.hospital.backend.model.Appointment;
import com.hospital.backend.model.Patient;
import com.hospital.backend.model.Prescription;
import com.hospital.backend.model.User;
import com.hospital.backend.repository.AppointmentRepository;
import com.hospital.backend.repository.PatientRepository;
import com.hospital.backend.repository.PrescriptionRepository;
import com.hospital.backend.repository.LabResultRepository;
import com.hospital.backend.repository.UserRepository;
import com.hospital.backend.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabResultRepository labResultRepository;
    private final UserRepository userRepository;

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

    @Override
    public Patient getMyProfile(String email) {
        return patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    @Override
    public List<MedicalRecordDTO> getMedicalHistory(String patientId) {
        List<MedicalRecordDTO> timeline = new ArrayList<>();

        // Add Appointments
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
        for (Appointment appt : appointments) {
            User doctor = userRepository.findById(appt.getDoctorId()).orElse(null);
            timeline.add(MedicalRecordDTO.builder()
                    .id(appt.getId())
                    .date(appt.getAppointmentDate())
                    .type("APPOINTMENT")
                    .title("Appointment with " + (doctor != null ? doctor.getFullName() : "Unknown"))
                    .description(appt.getReason())
                    .doctorName(doctor != null ? doctor.getFullName() : "Unknown")
                    .status(appt.getStatus())
                    .build());
        }

        // Add Prescriptions
        List<Prescription> prescriptions = prescriptionRepository.findByPatientId(patientId);
        for (Prescription presc : prescriptions) {
            User doctor = userRepository.findById(presc.getDoctorId()).orElse(null);
            timeline.add(MedicalRecordDTO.builder()
                    .id(presc.getId())
                    .date(presc.getCreatedAt().split("T")[0])
                    .type("PRESCRIPTION")
                    .title("Prescription from " + (doctor != null ? doctor.getFullName() : "Unknown"))
                    .description(presc.getDiagnosis() != null ? presc.getDiagnosis() : "Routine Checkup")
                    .doctorName(doctor != null ? doctor.getFullName() : "Unknown")
                    .status("ISSUED")
                    .build());
        }

        // Add Lab Results
        List<com.hospital.backend.model.LabResult> labs = labResultRepository.findByPatientId(patientId);
        for (com.hospital.backend.model.LabResult lab : labs) {
            User doctor = userRepository.findById(lab.getDoctorId()).orElse(null);
            timeline.add(MedicalRecordDTO.builder()
                    .id(lab.getId())
                    .date(lab.getTestDate())
                    .type("LAB_RESULT")
                    .title(lab.getTestName())
                    .description("Result: " + lab.getResultValue() + " " + (lab.getUnit() != null ? lab.getUnit() : ""))
                    .doctorName(doctor != null ? doctor.getFullName() : "Unknown")
                    .status(lab.getStatus())
                    .build());
        }

        // Sort by date descending
        return timeline.stream()
                .sorted(Comparator.comparing(MedicalRecordDTO::getDate).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public Patient addFamilyMember(String patientId, Patient.FamilyMember member) {
        Patient patient = getPatientById(patientId);
        List<Patient.FamilyMember> members = patient.getFamilyMembers();
        if (members == null) {
            members = new ArrayList<>();
        }
        member.setId(java.util.UUID.randomUUID().toString());
        members.add(member);
        patient.setFamilyMembers(members);
        return patientRepository.save(patient);
    }

    @Override
    public List<Patient.FamilyMember> getFamilyMembers(String patientId) {
        Patient patient = getPatientById(patientId);
        return patient.getFamilyMembers() != null ? patient.getFamilyMembers() : new ArrayList<>();
    }
}