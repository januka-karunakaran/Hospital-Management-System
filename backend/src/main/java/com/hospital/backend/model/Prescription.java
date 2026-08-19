package com.hospital.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    private String id;

    private String appointmentId;
    private String doctorId;
    private String patientId;

    private List<String> medicines;
    private String diagnosis;
    private String notes;
    private String dosageInstructions;
    private String createdAt;
}