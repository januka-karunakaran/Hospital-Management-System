package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for appointment filter results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentFilterResponse {
    private String appointmentId;
    private String doctorName;
    private String patientName;
    private String appointmentDate;
    private String appointmentTime;
    private String reason;
    private String status;
    private String doctorId;
    private String patientId;
}
