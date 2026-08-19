package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientAppointmentDTO {
    private String appointmentId;
    private String doctorName;
    private String doctorSpecialization;
    private String appointmentDate;
    private String appointmentTime;
    private String reason;
    private String status; // PENDING, COMPLETED, CANCELLED
    private String doctorPhotoUrl;
    private Boolean isUpcoming; // true if date is in future
    private Long daysUntil; // null if past appointment
    private String doctorId;
}
