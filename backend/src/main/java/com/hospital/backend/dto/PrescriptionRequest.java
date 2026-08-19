package com.hospital.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class PrescriptionRequest {

    @NotBlank(message = "Appointment ID is required")
    private String appointmentId;

    @NotBlank(message = "Doctor ID is required")
    private String doctorId;

    @NotBlank(message = "Patient ID is required")
    private String patientId;

    private String diagnosis;

    @NotEmpty(message = "Medicines list cannot be empty")
    private List<String> medicines;

    @NotBlank(message = "Notes are required")
    private String notes;

    @NotBlank(message = "Dosage instructions are required")
    private String dosageInstructions;
}
