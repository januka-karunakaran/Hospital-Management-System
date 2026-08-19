package com.hospital.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    private String id;
    private String timestamp;
    private String userId;
    private String userName;
    private String action; // LOGIN, CREATE_APPOINTMENT, UPDATE_BED, etc.
    private String details;
    private String ipAddress;
}
