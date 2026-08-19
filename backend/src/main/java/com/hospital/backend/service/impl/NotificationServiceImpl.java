package com.hospital.backend.service.impl;

import com.hospital.backend.dto.NotificationResponse;
import com.hospital.backend.exception.ResourceNotFoundException;
import com.hospital.backend.model.Doctor;
import com.hospital.backend.model.Notification;
import com.hospital.backend.model.Patient;
import com.hospital.backend.model.User;
import com.hospital.backend.repository.DoctorRepository;
import com.hospital.backend.repository.NotificationRepository;
import com.hospital.backend.repository.PatientRepository;
import com.hospital.backend.repository.UserRepository;
import com.hospital.backend.service.MailService;
import com.hospital.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final MailService mailService;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    // ─── Core notification helpers ─────────────────────────────────────────────

    @Override
    public Notification createNotification(Notification notification) {
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    @Override
    public void sendNotification(String userId, Notification notification) {
        try {
            Notification saved = createNotification(notification);

            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/notifications",
                    mapToResponse(saved)
            );

            log.info("Notification sent to user: {} - {}", userId, saved.getTitle());
        } catch (Exception e) {
            log.error("Error sending notification to user: {}", userId, e);
        }
    }

    // ─── Read / Write operations ───────────────────────────────────────────────

    @Override
    public List<NotificationResponse> getNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationResponse> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unreadNotifications.forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unreadNotifications);
    }

    @Override
    public void deleteNotification(String notificationId) {
        notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notificationRepository.deleteById(notificationId);
    }

    @Override
    public void deleteAllNotifications(String userId) {
        notificationRepository.deleteByUserId(userId);
    }

    // ─── Appointment notifications ─────────────────────────────────────────────

    @Override
    public void notifyAppointmentCreated(String appointmentId, String patientId, String doctorId, String appointmentTime) {
        // Resolve names / emails
        String patientName = resolveUserName(patientId);
        String patientEmail = resolveUserEmail(patientId);
        String doctorName = resolveDoctorName(doctorId);
        String doctorEmail = resolveDoctorEmail(doctorId);

        String[] parts = appointmentTime.split(" ", 2);
        String date = parts.length > 0 ? parts[0] : appointmentTime;
        String time = parts.length > 1 ? parts[1] : "";

        // WebSocket to patient
        Notification patientNotif = Notification.builder()
                .userId(patientId)
                .senderUserId(doctorId)
                .title("Appointment Confirmed")
                .message("Your appointment has been scheduled for " + appointmentTime)
                .type("APPOINTMENT")
                .referenceId(appointmentId)
                .referenceType("APPOINTMENT")
                .actionUrl("/patient/appointments/" + appointmentId)
                .build();
        sendNotification(patientId, patientNotif);

        // WebSocket to doctor
        Notification doctorNotif = Notification.builder()
                .userId(doctorId)
                .senderUserId(patientId)
                .title("New Appointment")
                .message("You have a new appointment scheduled for " + appointmentTime)
                .type("APPOINTMENT")
                .referenceId(appointmentId)
                .referenceType("APPOINTMENT")
                .actionUrl("/doctor/appointments/" + appointmentId)
                .build();
        sendNotification(doctorId, doctorNotif);

        // Email to patient
        if (patientEmail != null) {
            mailService.sendAppointmentConfirmedToPatient(patientEmail, patientName, doctorName, date, time);
        }

        // Email to doctor
        if (doctorEmail != null) {
            mailService.sendAppointmentConfirmedToDoctor(doctorEmail, doctorName, patientName, date, time);
        }
    }

    @Override
    public void notifyAppointmentUpdated(String appointmentId, String patientId, String doctorId) {
        String patientName = resolveUserName(patientId);
        String patientEmail = resolveUserEmail(patientId);
        String doctorName = resolveDoctorName(doctorId);

        Notification patientNotif = Notification.builder()
                .userId(patientId)
                .senderUserId(doctorId)
                .title("Appointment Updated")
                .message("Your appointment details have been updated")
                .type("APPOINTMENT")
                .referenceId(appointmentId)
                .referenceType("APPOINTMENT")
                .actionUrl("/patient/appointments/" + appointmentId)
                .build();
        sendNotification(patientId, patientNotif);

        Notification doctorNotif = Notification.builder()
                .userId(doctorId)
                .senderUserId(patientId)
                .title("Appointment Updated")
                .message("An appointment has been updated")
                .type("APPOINTMENT")
                .referenceId(appointmentId)
                .referenceType("APPOINTMENT")
                .actionUrl("/doctor/appointments/" + appointmentId)
                .build();
        sendNotification(doctorId, doctorNotif);

        // Email to patient
        if (patientEmail != null) {
            mailService.sendAppointmentUpdatedToPatient(patientEmail, patientName, doctorName, "COMPLETED");
        }
    }

    @Override
    public void notifyAppointmentCancelled(String appointmentId, String patientId, String doctorId) {
        String patientName = resolveUserName(patientId);
        String patientEmail = resolveUserEmail(patientId);
        String doctorName = resolveDoctorName(doctorId);
        String doctorEmail = resolveDoctorEmail(doctorId);

        Notification patientNotif = Notification.builder()
                .userId(patientId)
                .title("Appointment Cancelled")
                .message("Your appointment has been cancelled")
                .type("APPOINTMENT")
                .referenceId(appointmentId)
                .referenceType("APPOINTMENT")
                .build();
        sendNotification(patientId, patientNotif);

        Notification doctorNotif = Notification.builder()
                .userId(doctorId)
                .title("Appointment Cancelled")
                .message("An appointment has been cancelled")
                .type("APPOINTMENT")
                .referenceId(appointmentId)
                .referenceType("APPOINTMENT")
                .build();
        sendNotification(doctorId, doctorNotif);

        // Emails
        if (patientEmail != null) {
            mailService.sendAppointmentCancelledToPatient(patientEmail, patientName, doctorName, "—", "—");
        }
        if (doctorEmail != null) {
            mailService.sendAppointmentCancelledToDoctor(doctorEmail, doctorName, patientName, "—", "—");
        }
    }

    // ─── Prescription notifications ────────────────────────────────────────────

    @Override
    public void notifyPrescriptionCreated(String prescriptionId, String patientId, String doctorId) {
        String patientName = resolveUserName(patientId);
        String patientEmail = resolveUserEmail(patientId);
        String doctorName = resolveDoctorName(doctorId);

        Notification patientNotif = Notification.builder()
                .userId(patientId)
                .senderUserId(doctorId)
                .title("New Prescription")
                .message("Dr. " + doctorName + " has issued a new prescription for you")
                .type("PRESCRIPTION")
                .referenceId(prescriptionId)
                .referenceType("PRESCRIPTION")
                .actionUrl("/patient/my-prescriptions")
                .build();
        sendNotification(patientId, patientNotif);

        // Email to patient
        if (patientEmail != null) {
            mailService.sendPrescriptionReadyToPatient(patientEmail, patientName, doctorName, null);
        }
    }

    // ─── Report notifications ──────────────────────────────────────────────────

    @Override
    public void notifyReportAvailable(String reportId, String patientId) {
        Notification patientNotif = Notification.builder()
                .userId(patientId)
                .title("Report Available")
                .message("Your medical report is now available")
                .type("REPORT")
                .referenceId(reportId)
                .referenceType("REPORT")
                .actionUrl("/patient/reports")
                .build();
        sendNotification(patientId, patientNotif);
    }

    @Override
    public void sendSystemNotification(String userId, String title, String message) {
        Notification notif = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type("SYSTEM")
                .build();
        sendNotification(userId, notif);
    }

    // ─── Email resolution helpers ──────────────────────────────────────────────

    private String resolveUserName(String userId) {
        return userRepository.findById(userId)
                .map(User::getFullName)
                .orElse("User");
    }

    private String resolveUserEmail(String userId) {
        return userRepository.findById(userId)
                .map(User::getEmail)
                .orElse(null);
    }

    private String resolveDoctorName(String doctorUserId) {
        // doctorId can be either the Doctor document id or the userId
        return doctorRepository.findByUserId(doctorUserId)
                .map(Doctor::getFullName)
                .orElseGet(() -> doctorRepository.findById(doctorUserId)
                        .map(Doctor::getFullName)
                        .orElseGet(() -> userRepository.findById(doctorUserId)
                                .map(User::getFullName)
                                .orElse("Doctor")));
    }

    private String resolveDoctorEmail(String doctorUserId) {
        // Try by userId first, then by document id, then User table
        return doctorRepository.findByUserId(doctorUserId)
                .map(Doctor::getEmail)
                .orElseGet(() -> doctorRepository.findById(doctorUserId)
                        .map(Doctor::getEmail)
                        .orElseGet(() -> userRepository.findById(doctorUserId)
                                .map(User::getEmail)
                                .orElse(null)));
    }

    // ─── Mapper ────────────────────────────────────────────────────────────────

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .senderUserId(notification.getSenderUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .actionUrl(notification.getActionUrl())
                .build();
    }
}
