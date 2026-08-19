package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorPerformanceDTO {
    private String doctorId;
    private String doctorName;
    private String specialization;
    private long totalAppointments;
    private long completedAppointments;
    private double avgRating;
    private double appointmentRate;
}
