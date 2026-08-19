package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatsDTO {
    private long totalUsers;
    private long totalDoctors;
    private long totalPatients;
    private long totalAdmins;
    private long newPatientsThisMonth;
    private long activePatientsThisMonth;
    private long activeAppointmentsToday;
}
