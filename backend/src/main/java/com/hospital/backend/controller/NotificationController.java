package com.hospital.backend.controller;

import com.hospital.backend.dto.NotificationResponse;
import com.hospital.backend.service.NotificationService;
import com.hospital.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    /**
     * Get all notifications for current user
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication authentication) {
        String userId = userService.getUserIdByEmail(authentication.getName());
        List<NotificationResponse> notifications = notificationService.getNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notifications for current user
     */
    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(Authentication authentication) {
        String userId = userService.getUserIdByEmail(authentication.getName());
        List<NotificationResponse> unreadNotifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(unreadNotifications);
    }

    /**
     * Get unread count for current user
     */
    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getUnreadCount(Authentication authentication) {
        String userId = userService.getUserIdByEmail(authentication.getName());
        long count = notificationService.getUnreadCount(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Mark specific notification as read
     */
    @PutMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable String notificationId) {
        notificationService.markAsRead(notificationId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification marked as read");
        return ResponseEntity.ok(response);
    }

    /**
     * Mark all notifications as read for current user
     */
    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication authentication) {
        String userId = userService.getUserIdByEmail(authentication.getName());
        notificationService.markAllAsRead(userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }

    /**
     * Delete specific notification
     */
    @DeleteMapping("/{notificationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable String notificationId) {
        notificationService.deleteNotification(notificationId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification deleted");
        return ResponseEntity.ok(response);
    }

    /**
     * Delete all notifications for current user
     */
    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deleteAllNotifications(Authentication authentication) {
        String userId = userService.getUserIdByEmail(authentication.getName());
        notificationService.deleteAllNotifications(userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications deleted");
        return ResponseEntity.ok(response);
    }
}
