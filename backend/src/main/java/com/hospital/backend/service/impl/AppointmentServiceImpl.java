package com.hospital.backend.service.impl;

import com.hospital.backend.dto.AppointmentRequest;
import com.hospital.backend.dto.AvailableSlotsResponse;
import com.hospital.backend.exception.BadRequestException;
import com.hospital.backend.model.Appointment;
import com.hospital.backend.model.Doctor;
import com.hospital.backend.model.Patient;
import com.hospital.backend.model.User;
import com.hospital.backend.enums.Role;
import com.hospital.backend.repository.AppointmentRepository;
import com.hospital.backend.repository.DoctorRepository;
import com.hospital.backend.repository.PatientRepository;
import com.hospital.backend.repository.UserRepository;
import com.hospital.backend.service.AppointmentService;
import com.hospital.backend.service.AvailabilityService;
import com.hospital.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final NotificationService notificationService;
    private final AvailabilityService availabilityService;
    private final UserRepository userRepository;

    @Override
    public synchronized Appointment createAppointment(AppointmentRequest request) {
        Doctor selectedDoctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        patientRepository.findById(request.getPatientId()).orElseGet(() -> {
            User patientUser = userRepository.findById(request.getPatientId())
                    .filter(user -> user.getRole() == Role.PATIENT)
                    .orElseThrow(() -> new BadRequestException("Patient account not found"));

            Patient patient = Patient.builder()
                    .userId(patientUser.getId())
                    .fullName(patientUser.getFullName())
                    .email(patientUser.getEmail())
                    .phone(patientUser.getPhoneNumber())
                    .address(patientUser.getAddress())
                    .build();
            return patientRepository.save(patient);
        });

        AvailableSlotsResponse slotAvailability = availabilityService.getAvailableSlots(
                request.getDoctorId(), request.getAppointmentDate());
        if (!slotAvailability.isScheduleConfigured()) {
            throw new BadRequestException("This doctor has not configured a schedule for the selected date");
        }
        if (!slotAvailability.isAvailable()) {
            throw new BadRequestException(slotAvailability.getReason() != null
                    ? "Doctor unavailable: " + slotAvailability.getReason()
                    : "Doctor is unavailable on the selected date");
        }
        if (!slotAvailability.getAvailableSlots().contains(request.getAppointmentTime())) {
            throw new BadRequestException("The selected time slot is no longer available");
        }

        List<Appointment> appointmentsForDay = appointmentRepository
                .findByDoctorIdAndAppointmentDate(request.getDoctorId(), request.getAppointmentDate());
        int nextTokenNumber = appointmentsForDay.stream()
                .map(Appointment::getTokenNumber)
                .filter(token -> token != null)
                .max(Integer::compareTo)
                .orElse(0) + 1;

        Appointment appointment = Appointment.builder()
                .doctorId(request.getDoctorId())
                .patientId(request.getPatientId())
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .tokenNumber(nextTokenNumber)
                .reason(request.getReason())
                .status("PENDING")
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Send notifications to both doctor and patient
        try {
            notificationService.notifyAppointmentCreated(
                    savedAppointment.getId(),
                    savedAppointment.getPatientId(),
                    selectedDoctor.getUserId() != null ? selectedDoctor.getUserId() : savedAppointment.getDoctorId(),
                    savedAppointment.getAppointmentDate() + " " + savedAppointment.getAppointmentTime()
            );
        } catch (Exception e) {
            // Log but don't fail appointment creation if notification fails
            System.err.println("Failed to send appointment notification: " + e.getMessage());
        }

        return savedAppointment;
    }

    @Override
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @Override
    public Appointment getAppointmentById(String id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    @Override
    public List<Appointment> getAppointmentsByDoctorId(String doctorId) {
        String appointmentDoctorId = doctorRepository.findByUserId(doctorId)
                .map(doctor -> doctor.getId())
                .orElse(doctorId);
        return appointmentRepository.findByDoctorId(appointmentDoctorId);
    }

    @Override
    public List<Appointment> getAppointmentsByPatientId(String patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    @Override
    public List<Appointment> getMyAppointments(String patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    @Override
    public Appointment updateAppointmentStatus(String id, String status) {
        Appointment appointment = getAppointmentById(id);
        String previousStatus = appointment.getStatus();
        appointment.setStatus(status);
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Send notification when status changes
        if (!previousStatus.equals(status)) {
            try {
                if ("CANCELLED".equalsIgnoreCase(status)) {
                    notificationService.notifyAppointmentCancelled(
                            appointment.getId(),
                            appointment.getPatientId(),
                            appointment.getDoctorId()
                    );
                } else if ("COMPLETED".equalsIgnoreCase(status)) {
                    notificationService.notifyAppointmentUpdated(
                            appointment.getId(),
                            appointment.getPatientId(),
                            appointment.getDoctorId()
                    );
                }
            } catch (Exception e) {
                System.err.println("Failed to send status update notification: " + e.getMessage());
            }
        }

        return updatedAppointment;
    }

    @Override
    public void deleteAppointment(String id) {
        appointmentRepository.deleteById(id);
    }
}
