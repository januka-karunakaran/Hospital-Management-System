package com.hospital.backend.service.impl;

import com.hospital.backend.dto.*;
import com.hospital.backend.model.*;
import com.hospital.backend.repository.*;
import com.hospital.backend.service.PatientDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientDashboardServiceImpl implements PatientDashboardService {

    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public PatientDashboardSummaryDTO getPatientDashboard(String patientId) {
        PatientHealthStatsDTO healthStats = getPatientHealthStats(patientId);
        List<PatientAppointmentDTO> upcomingAppointments = getUpcomingAppointments(patientId, 5);
        List<PatientAppointmentDTO> pastAppointments = getPastAppointments(patientId, 5);
        List<PatientPrescriptionDTO> activePrescriptions = getActivePrescriptions(patientId);
        List<PatientPrescriptionDTO> recentPrescriptions = getRecentPrescriptions(patientId, 5);
        
        long totalNotifications = notificationRepository.countByUserId(patientId);
        long unreadNotifications = notificationRepository.countByUserIdAndIsReadFalse(patientId);

        return PatientDashboardSummaryDTO.builder()
                .healthStats(healthStats)
                .upcomingAppointments(upcomingAppointments)
                .pastAppointments(pastAppointments)
                .activePrescriptions(activePrescriptions)
                .recentPrescriptions(recentPrescriptions)
                .totalNotifications((int) totalNotifications)
                .unreadNotifications((int) unreadNotifications)
                .build();
    }

    @Override
    public PatientHealthStatsDTO getPatientHealthStats(String patientId) {
        List<Appointment> allAppointments = appointmentRepository.findByPatientId(patientId);
        List<Prescription> allPrescriptions = prescriptionRepository.findByPatientId(patientId);

        int totalAppointments = allAppointments.size();
        int completedAppointments = (int) allAppointments.stream()
                .filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus()))
                .count();
        int cancelledAppointments = (int) allAppointments.stream()
                .filter(a -> "CANCELLED".equalsIgnoreCase(a.getStatus()))
                .count();
        int upcomingAppointments = (int) allAppointments.stream()
                .filter(a -> "PENDING".equalsIgnoreCase(a.getStatus()))
                .count();

        int activePrescriptions = (int) allPrescriptions.stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(getStatus(p)))
                .count();

        double completionRate = totalAppointments > 0 ? (completedAppointments * 100.0 / totalAppointments) : 0;

        // Get next appointment
        PatientAppointmentDTO nextAppt = getNextAppointment(patientId);
        String nextAppointmentDate = nextAppt != null ? nextAppt.getAppointmentDate() : null;
        String nextAppointmentDoctor = nextAppt != null ? nextAppt.getDoctorName() : null;
        String nextAppointmentTime = nextAppt != null ? nextAppt.getAppointmentTime() : null;

        // Get last appointment
        String lastAppointmentDate = allAppointments.stream()
                .filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus()))
                .max(Comparator.comparing(a -> {
                    try {
                        return LocalDate.parse(a.getAppointmentDate());
                    } catch (Exception e) {
                        return LocalDate.MIN;
                    }
                }))
                .map(Appointment::getAppointmentDate)
                .orElse(null);

        return PatientHealthStatsDTO.builder()
                .totalAppointments(totalAppointments)
                .completedAppointments(completedAppointments)
                .upcomingAppointments(upcomingAppointments)
                .cancelledAppointments(cancelledAppointments)
                .activePrescriptions(activePrescriptions)
                .totalPrescriptions(allPrescriptions.size())
                .appointmentCompletionRate(completionRate)
                .lastAppointmentDate(lastAppointmentDate)
                .nextAppointmentDate(nextAppointmentDate)
                .nextAppointmentDoctor(nextAppointmentDoctor)
                .nextAppointmentTime(nextAppointmentTime)
                .build();
    }

    @Override
    public List<PatientAppointmentDTO> getUpcomingAppointments(String patientId, Integer limit) {
        LocalDate today = LocalDate.now();
        
        List<PatientAppointmentDTO> upcoming = appointmentRepository.findByPatientId(patientId)
                .stream()
                .filter(a -> "PENDING".equalsIgnoreCase(a.getStatus()))
                .filter(a -> {
                    try {
                        LocalDate appointmentDate = LocalDate.parse(a.getAppointmentDate());
                        return appointmentDate.isAfter(today) || appointmentDate.isEqual(today);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .sorted(Comparator.comparing(Appointment::getAppointmentDate))
                .limit(limit != null ? limit : 5)
                .map(this::convertAppointmentToDTO)
                .collect(Collectors.toList());

        return upcoming;
    }

    @Override
    public List<PatientAppointmentDTO> getPastAppointments(String patientId, Integer limit) {
        LocalDate today = LocalDate.now();
        
        List<PatientAppointmentDTO> past = appointmentRepository.findByPatientId(patientId)
                .stream()
                .filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus()) || 
                        ("CANCELLED".equalsIgnoreCase(a.getStatus())))
                .filter(a -> {
                    try {
                        LocalDate appointmentDate = LocalDate.parse(a.getAppointmentDate());
                        return appointmentDate.isBefore(today);
                    } catch (Exception e) {
                        return true;
                    }
                })
                .sorted(Comparator.comparing(Appointment::getAppointmentDate).reversed())
                .limit(limit != null ? limit : 5)
                .map(this::convertAppointmentToDTO)
                .collect(Collectors.toList());

        return past;
    }

    @Override
    public List<PatientAppointmentDTO> getAllAppointments(String patientId) {
        return appointmentRepository.findByPatientId(patientId)
                .stream()
                .sorted(Comparator.comparing(Appointment::getAppointmentDate).reversed())
                .map(this::convertAppointmentToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PatientPrescriptionDTO> getActivePrescriptions(String patientId) {
        return prescriptionRepository.findByPatientId(patientId)
                .stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(getStatus(p)))
                .map(this::convertPrescriptionToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PatientPrescriptionDTO> getRecentPrescriptions(String patientId, Integer limit) {
        return prescriptionRepository.findByPatientId(patientId)
                .stream()
                .sorted(Comparator.comparing(Prescription::getCreatedAt).reversed())
                .limit(limit != null ? limit : 5)
                .map(this::convertPrescriptionToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public String getPrescriptionStatus(String prescriptionId) {
        // Status can be: ACTIVE, COMPLETED, EXPIRED
        // For now, mark as ACTIVE if recent, COMPLETED if old
        Prescription prescription = prescriptionRepository.findById(prescriptionId).orElse(null);
        if (prescription == null) return "UNKNOWN";
        return getStatus(prescription);
    }

    @Override
    public Integer getAppointmentCount(String patientId, String status) {
        return (int) appointmentRepository.findByPatientId(patientId)
                .stream()
                .filter(a -> status.equalsIgnoreCase(a.getStatus()))
                .count();
    }

    @Override
    public Double getAppointmentCompletionRate(String patientId) {
        List<Appointment> allAppointments = appointmentRepository.findByPatientId(patientId);
        if (allAppointments.isEmpty()) return 0.0;
        
        long completed = allAppointments.stream()
                .filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus()))
                .count();
        
        return (completed * 100.0) / allAppointments.size();
    }

    @Override
    public PatientAppointmentDTO getNextAppointment(String patientId) {
        LocalDate today = LocalDate.now();
        
        return appointmentRepository.findByPatientId(patientId)
                .stream()
                .filter(a -> "PENDING".equalsIgnoreCase(a.getStatus()))
                .filter(a -> {
                    try {
                        LocalDate appointmentDate = LocalDate.parse(a.getAppointmentDate());
                        return appointmentDate.isAfter(today) || appointmentDate.isEqual(today);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .sorted(Comparator.comparing(Appointment::getAppointmentDate))
                .map(this::convertAppointmentToDTO)
                .findFirst()
                .orElse(null);
    }

    @Override
    public List<Object> getAppointmentHistory(String patientId, Integer days) {
        // Return daily appointment counts for charting
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days != null ? days : 30);
        
        Map<String, Integer> dailyCount = new LinkedHashMap<>();
        
        // Initialize all dates
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            dailyCount.put(date.toString(), 0);
        }
        
        // Count appointments
        appointmentRepository.findByPatientId(patientId)
                .stream()
                .forEach(a -> {
                    try {
                        LocalDate appointmentDate = LocalDate.parse(a.getAppointmentDate());
                        if (!appointmentDate.isBefore(startDate) && !appointmentDate.isAfter(endDate)) {
                            dailyCount.merge(appointmentDate.toString(), 1, Integer::sum);
                        }
                    } catch (Exception e) {
                        // Skip invalid dates
                    }
                });
        
        List<Object> result = new ArrayList<>();
        dailyCount.forEach((date, count) -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("date", date);
            entry.put("appointments", count);
            result.add(entry);
        });
        
        return result;
    }

    @Override
    public List<PatientPrescriptionDTO> getPrescriptionTimeline(String patientId) {
        return prescriptionRepository.findByPatientId(patientId)
                .stream()
                .sorted(Comparator.comparing(Prescription::getCreatedAt).reversed())
                .map(this::convertPrescriptionToDTO)
                .collect(Collectors.toList());
    }

    // Helper methods
    private PatientAppointmentDTO convertAppointmentToDTO(Appointment appointment) {
        Doctor doctor = doctorRepository.findById(appointment.getDoctorId()).orElse(null);
        User doctorUser = doctor != null ? userRepository.findById(doctor.getUserId()).orElse(null) : null;
        
        LocalDate appointmentDate = null;
        long daysUntil = 0;
        boolean isUpcoming = false;
        
        try {
            appointmentDate = LocalDate.parse(appointment.getAppointmentDate());
            LocalDate today = LocalDate.now();
            daysUntil = java.time.temporal.ChronoUnit.DAYS.between(today, appointmentDate);
            isUpcoming = appointmentDate.isAfter(today) || appointmentDate.isEqual(today);
        } catch (Exception e) {
            // Invalid date format
        }

        return PatientAppointmentDTO.builder()
                .appointmentId(appointment.getId())
                .doctorName(doctorUser != null ? doctorUser.getFullName() : "Unknown Doctor")
                .doctorSpecialization(doctor != null ? doctor.getSpecialization() : "N/A")
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .reason(appointment.getReason())
                .status(appointment.getStatus())
                .doctorPhotoUrl(doctorUser != null ? doctorUser.getPhotoUrl() : null)
                .isUpcoming(isUpcoming)
                .daysUntil(daysUntil)
                .doctorId(appointment.getDoctorId())
                .build();
    }

    private PatientPrescriptionDTO convertPrescriptionToDTO(Prescription prescription) {
        Doctor doctor = doctorRepository.findById(prescription.getDoctorId()).orElse(null);
        User doctorUser = doctor != null ? userRepository.findById(doctor.getUserId()).orElse(null) : null;
        
        String medicinesStr = prescription.getMedicines() != null
            ? String.join(", ", prescription.getMedicines())
            : "";
        
        return PatientPrescriptionDTO.builder()
                .prescriptionId(prescription.getId())
                .doctorName(doctorUser != null ? doctorUser.getFullName() : "Unknown Doctor")
                .doctorSpecialization(doctor != null ? doctor.getSpecialization() : "N/A")
                .createdDate(prescription.getCreatedAt())
                .status("UNKNOWN") // Assuming status is not applicable
                .medicineCount(prescription.getMedicines() != null ? prescription.getMedicines().size() : 0)
                .medicines(medicinesStr)
                .dosageInstructions(prescription.getDosageInstructions())
                .notes(prescription.getNotes())
                .doctorId(prescription.getDoctorId())
                .build();
    }

    private String getStatus(Prescription prescription) {
        // Determine status: ACTIVE if created within 30 days, else COMPLETED
        try {
            LocalDateTime createdDateTime = LocalDateTime.parse(prescription.getCreatedAt().replace(" ", "T"));
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            return createdDateTime.isAfter(thirtyDaysAgo) ? "ACTIVE" : "COMPLETED";
        } catch (Exception e) {
            return "UNKNOWN";
        }
    }
}
