package com.hospital.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    private String userId;

    private String fullName;
    private String email;
    private String phone;
    private String specialization;
    private Integer experienceYears;
    private List<String> availableDays;
    private String status; // ACTIVE / INACTIVE
}