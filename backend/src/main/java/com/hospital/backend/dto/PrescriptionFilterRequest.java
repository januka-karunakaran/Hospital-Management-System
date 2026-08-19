package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for filtering prescriptions
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionFilterRequest {
    private String status;               // ACTIVE, COMPLETED, EXPIRED
    private String startDate;            // ISO 8601 format (yyyy-MM-dd)
    private String endDate;              // ISO 8601 format (yyyy-MM-dd)
    private String doctorId;             // Filter by doctor who prescribed
    private String patientId;            // Filter by patient who received
    private String medicine;             // Search in medicine names
    private String sortBy;               // "date", "doctor", "status"
    private String sortOrder;            // "asc" or "desc"
    private Integer limit;               // Max results (default 20)
    private Integer offset;              // For pagination (default 0)
}
