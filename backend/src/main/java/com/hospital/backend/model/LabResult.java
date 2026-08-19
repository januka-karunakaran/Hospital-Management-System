package com.hospital.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "lab_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabResult {
    @Id
    private String id;
    private String appointmentId;
    private String patientId;
    private String doctorId;
    private String testName;
    private String resultValue;
    private String unit;
    private String referenceRange;
    private String status; // NORMAL, ABNORMAL
    private String testDate;
    private String notes;
}
