package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for prescription filter results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionFilterResponse {
    private String prescriptionId;
    private String doctorName;
    private String patientName;
    private String createdDate;
    private String status;
    private String medicines;
    private String dosageInstructions;
    private String doctorId;
    private String patientId;
}
