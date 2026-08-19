package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecordDTO {
    private String id;
    private String date;
    private String type; // APPOINTMENT, PRESCRIPTION, LAB_RESULT
    private String title;
    private String description;
    private String doctorName;
    private String status;
}
