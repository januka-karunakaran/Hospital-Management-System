package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentStatsDTO {
    private long totalAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long pendingAppointments;
    private double completionRate;
}
