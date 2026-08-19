package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {
    private UserStatsDTO userStats;
    private AppointmentStatsDTO appointmentStats;
    private RevenueStatsDTO revenueStats;
    private List<DailyMetricsDTO> dailyMetrics;
    private List<DoctorPerformanceDTO> topDoctors;
    private long pendingAppointmentsCount;
    private long totalNotifications;
}
