package com.hospital.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    private String userId;          // Recipient

    private String senderUserId;    // Who sent it (optional)

    private String title;

    private String message;

    private String type;            // APPOINTMENT, PRESCRIPTION, REPORT, SYSTEM

    private String referenceId;     // ID of the related entity (appointment, prescription, etc.)

    private String referenceType;   // APPOINTMENT, PRESCRIPTION, REPORT

    private boolean isRead;

    private LocalDateTime createdAt;

    private LocalDateTime readAt;

    private String actionUrl;       // Link to navigate to related entity

    @Override
    public String toString() {
        return "Notification{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", title='" + title + '\'' +
                ", message='" + message + '\'' +
                ", type='" + type + '\'' +
                ", isRead=" + isRead +
                ", createdAt=" + createdAt +
                '}';
    }
}
