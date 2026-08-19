package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientPrescriptionDTO {
    private String prescriptionId;
    private String doctorName;
    private String doctorSpecialization;
    private String createdDate;
    private String status; // ACTIVE, COMPLETED, EXPIRED
    private Integer medicineCount;
    private String medicines; // Comma-separated or array
    private String dosageInstructions;
    private String notes;
    private String appointmentDate;
    private String doctorId;
}
