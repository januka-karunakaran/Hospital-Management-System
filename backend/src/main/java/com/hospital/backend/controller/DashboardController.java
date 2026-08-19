package com.hospital.backend.controller;

import com.hospital.backend.dto.*;
import com.hospital.backend.service.DashboardService;
import com.hospital.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;

    /**
     * Get complete dashboard summary (Admin only)
     */
    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(Authentication authentication) {
        String email = authentication.getName();
        String userId = userService.getUserIdByEmail(email);
        DashboardSummaryDTO summary = dashboardService.getDashboardSummary(userId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get user statistics
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserStatsDTO> getUserStats() {
        UserStatsDTO stats = dashboardService.getUserStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get appointment statistics
     */
    @GetMapping("/appointments")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<AppointmentStatsDTO> getAppointmentStats() {
        AppointmentStatsDTO stats = dashboardService.getAppointmentStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get revenue statistics
     */
    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RevenueStatsDTO> getRevenueStats() {
        RevenueStatsDTO stats = dashboardService.getRevenueStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get daily metrics for last N days
     */
    @GetMapping("/daily-metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DailyMetricsDTO>> getDailyMetrics(
            @RequestParam(defaultValue = "7") int days) {
        List<DailyMetricsDTO> metrics = dashboardService.getDailyMetrics(days);
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get appointment trends
     */
    @GetMapping("/appointments/trends")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<List<DailyMetricsDTO>> getAppointmentTrends(
            @RequestParam(defaultValue = "30") int days) {
        List<DailyMetricsDTO> trends = dashboardService.getAppointmentTrends(days);
        return ResponseEntity.ok(trends);
    }

    /**
     * Get revenue trends
     */
    @GetMapping("/revenue/trends")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DailyMetricsDTO>> getRevenueTrends(
            @RequestParam(defaultValue = "30") int days) {
        List<DailyMetricsDTO> trends = dashboardService.getRevenueTrends(days);
        return ResponseEntity.ok(trends);
    }

    /**
     * Get top performing doctors
     */
    @GetMapping("/top-doctors")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<List<DoctorPerformanceDTO>> getTopDoctors(
            @RequestParam(defaultValue = "5") int limit) {
        List<DoctorPerformanceDTO> topDoctors = dashboardService.getTopDoctors(limit);
        return ResponseEntity.ok(topDoctors);
    }

    /**
     * Get specific doctor's performance
     */
    @GetMapping("/doctors/{doctorId}/performance")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<DoctorPerformanceDTO> getDoctorPerformance(
            @PathVariable String doctorId) {
        DoctorPerformanceDTO performance = dashboardService.getDoctorPerformance(doctorId);
        return ResponseEntity.ok(performance);
    }

    /**
     * Get specific doctor's appointment stats
     */
    @GetMapping("/doctors/{doctorId}/appointments")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<AppointmentStatsDTO> getDoctorAppointmentStats(
            @PathVariable String doctorId) {
        AppointmentStatsDTO stats = dashboardService.getDoctorAppointmentStats(doctorId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get completion rate
     */
    @GetMapping("/completion-rate")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Map<String, Double>> getCompletionRate() {
        Map<String, Double> response = new HashMap<>();
        response.put("completionRate", dashboardService.getCompletionRate());
        return ResponseEntity.ok(response);
    }

    /**
     * Get appointments count between dates
     */
    @GetMapping("/appointments/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getAppointmentsCount(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        long count = dashboardService.getAppointmentsCount(start, end);
        
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Get disease trends
     */
    @GetMapping("/disease-trends")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Map<String, Long>> getDiseaseTrends() {
        return ResponseEntity.ok(dashboardService.getDiseaseTrends());
    }
}
