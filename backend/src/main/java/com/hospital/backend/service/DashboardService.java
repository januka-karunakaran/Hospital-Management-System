package com.hospital.backend.service;

import com.hospital.backend.dto.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface DashboardService {

    // Overall dashboard
    DashboardSummaryDTO getDashboardSummary(String userId);

    // User statistics
    UserStatsDTO getUserStats();

    // Appointment statistics
    AppointmentStatsDTO getAppointmentStats();

    // Revenue statistics
    RevenueStatsDTO getRevenueStats();

    // Daily metrics for last N days
    List<DailyMetricsDTO> getDailyMetrics(int days);

    // Top performing doctors
    List<DoctorPerformanceDTO> getTopDoctors(int limit);

    // Appointments for specific doctor
    AppointmentStatsDTO getDoctorAppointmentStats(String doctorId);

    // Doctor performance metrics
    DoctorPerformanceDTO getDoctorPerformance(String doctorId);

    // Appointment trends (count by day for last N days)
    List<DailyMetricsDTO> getAppointmentTrends(int days);

    // Revenue trends
    List<DailyMetricsDTO> getRevenueTrends(int days);

    // Get appointments between dates
    long getAppointmentsCount(LocalDate startDate, LocalDate endDate);

    // Get completed appointments percentage
    double getCompletionRate();

    // Get disease trends (count by diagnosis)
    Map<String, Long> getDiseaseTrends();
}
