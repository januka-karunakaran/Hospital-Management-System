package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for filtering appointments
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentFilterRequest {
    private String status;               // PENDING, COMPLETED, CANCELLED
    private String startDate;            // ISO 8601 format (yyyy-MM-dd)
    private String endDate;              // ISO 8601 format (yyyy-MM-dd)
    private String doctorId;             // Filter by specific doctor
    private String patientId;            // Filter by specific patient
    private String reason;               // Search in appointment reason
    private String sortBy;               // "date", "status", "doctor", "patient"
    private String sortOrder;            // "asc" or "desc"
    private Integer limit;               // Max results (default 20)
    private Integer offset;              // For pagination (default 0)
}
