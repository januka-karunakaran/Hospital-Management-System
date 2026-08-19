package com.hospital.backend.service;

import com.hospital.backend.dto.NotificationResponse;
import com.hospital.backend.model.Notification;

import java.util.List;

public interface NotificationService {

    // Create and send notification
    Notification createNotification(Notification notification);

    // Send notification to user via WebSocket
    void sendNotification(String userId, Notification notification);

    // Get all notifications for user
    List<NotificationResponse> getNotifications(String userId);

    // Get unread notifications for user
    List<NotificationResponse> getUnreadNotifications(String userId);

    // Get unread count
    long getUnreadCount(String userId);

    // Mark notification as read
    void markAsRead(String notificationId);

    // Mark all as read
    void markAllAsRead(String userId);

    // Delete notification
    void deleteNotification(String notificationId);

    // Delete all notifications for user
    void deleteAllNotifications(String userId);

    // Notify about appointment
    void notifyAppointmentCreated(String appointmentId, String patientId, String doctorId, String appointmentTime);

    void notifyAppointmentUpdated(String appointmentId, String patientId, String doctorId);

    void notifyAppointmentCancelled(String appointmentId, String patientId, String doctorId);

    // Notify about prescription
    void notifyPrescriptionCreated(String prescriptionId, String patientId, String doctorId);

    // Notify about reports
    void notifyReportAvailable(String reportId, String patientId);

    // System notification
    void sendSystemNotification(String userId, String title, String message);
}
