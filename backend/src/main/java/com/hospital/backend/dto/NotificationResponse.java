package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private String id;

    private String userId;

    private String senderUserId;

    private String title;

    private String message;

    private String type;

    private String referenceId;

    private String referenceType;

    private boolean isRead;

    private LocalDateTime createdAt;

    private LocalDateTime readAt;

    private String actionUrl;
}
