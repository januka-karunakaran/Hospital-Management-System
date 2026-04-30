package com.hospital.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    private String id;

    private String patientId;
    private String doctorId;

    private String appointmentDate; // example: 2026-04-20
    private String appointmentTime; // example: 10:30 AM

    private String reason;
    private String status; // PENDING / APPROVED / REJECTED / COMPLETED
}