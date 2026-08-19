package com.hospital.backend.controller;

import com.hospital.backend.dto.*;
import com.hospital.backend.service.PatientDashboardService;
import com.hospital.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient/dashboard")
@RequiredArgsConstructor
public class PatientDashboardController {

    private final PatientDashboardService patientDashboardService;
    private final UserService userService;

    /**
     * Get complete patient dashboard summary
     * GET /api/patient/dashboard/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<PatientDashboardSummaryDTO> getDashboardSummary(Authentication authentication) {
        String email = authentication.getName();
        String patientId = userService.getUserIdByEmail(email);
        PatientDashboardSummaryDTO summary = patientDashboardService.getPatientDashboard(patientId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get patient health statistics
     * GET /api/patient/dashboard/health-stats
     */
    @GetMapping("/health-stats")
    public ResponseEntity<PatientHealthStatsDTO> getHealthStats(Authentication authentication) {
        String email = authentication.getName();
        String patientId = userService.getUserIdByEmail(email);
        PatientHealthStatsDTO stats = patientDashboardService.getPatientHealthStats(patientId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get upcoming appointments
     * GET /api/patient/dashboard/appointments/upcoming?limit=5
     */
    @GetMapping("/appointments/upcoming")
    public ResponseEntity<List<PatientAppointmentDTO>> getUpcomingAppointments(
            @RequestParam(defaultValue = "5") Integer limit,
            Authentication authentication) {
        String email = authentication.getName();
        String patientId = userService.getUserIdByEmail(email);
        List<PatientAppointmentDTO> appointments = patientDashboardService.getUpcomingAppointments(patientId, limit);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Get past appointments
     * GET /api/patient/dashboard/appointments/past?limit=5
     */
    @GetMapping("/appointments/past")
    public ResponseEntity<List<PatientAppointmentDTO>> getPastAppointments(
            @RequestParam(defaultValue = "5") Integer limit,
            Authentication authentication) {
        String email = authentication.getName();
        String patientId = userService.getUserIdByEmail(email);
        List<PatientAppointmentDTO> appointments = patientDashboardService.getPastAppointments(patientId, limit);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Get all appointments for patient
     * GET /api/patient/dashboard/appointments/all
     */
    @GetMapping("/appointments/all")
    public ResponseEntity<List<PatientAppointmentDTO>> getAllAppointments(Authentication authentication) {
        String email = authentication.getName();
        String patientId = userService.getUserIdByEmail(email);
        List<PatientAppointmentDTO> appointments = patientDashboardService.getAllAppointments(patientId);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Get active prescriptions
     * GET /api/patient/dashboard/prescriptions/active
     */
    @GetMapping("/prescriptions/active")
    public ResponseEntity<List<PatientPrescriptionDTO>> getActivePrescriptions(Authentication authentication) {
        String email = authentication.getName();
        String patientId = userService.getUserIdByEmail(email);
        List<PatientPrescriptionDTO> prescriptions = patientDashboardService.getActivePrescriptions(patientId);
        return ResponseEntity.ok(prescriptions);
    }

    /**
     * Get recent prescriptions
     * GET /api/patient/dashboard/prescriptions/recent?limit=5
     */
    @GetMapping("/prescriptions/recent")
    public ResponseEntity<List<PatientPrescriptionDTO>> getRecentPrescriptions(
            @RequestParam(defaultValue = "5") Integer limit,
            Authentication authentication) {
        String email = authentication.getName();
        String patientId = userService.getUserIdByEmail(email);
        List<PatientPrescriptionDTO> prescriptions = patientDashboardService.getRecentPrescriptions(patientId, limit);
        return ResponseEntity.ok(prescriptions);
    }

    /**
     * Get next appointment
     * GET /api/patient/dashboard/appointments/next
     */
    @GetMapping("/appointments/next")
    public ResponseEntity<PatientAppointmentDTO> getNextAppointment(Authentication authentication) {
        String email = authentication.getName();
        String patientId = userService.getUserIdByEmail(email);
        PatientAppointmentDTO nextAppointment = patientDashboardService.getNextAppointment(patientId);
        return ResponseEntity.ok(nextAppointment);
    }

    /**
     * Get appointment history for charting
     * GET /api/patient/dashboard/appointments/history?days=30
     */
    @GetMapping("/appointments/history")
    public ResponseEntity<List<Object>> getAppointmentHistory(
            @RequestParam(defaultValue = "30") Integer days,
            Authentication authentication) {
        String email = authentication.getName();
        String patientId = userService.getUserIdByEmail(email);
        List<Object> history = patientDashboardService.getAppointmentHistory(patientId, days);
        return ResponseEntity.ok(history);
    }

    /**
     * Get appointment count by status
     * GET /api/patient/dashboard/appointments/count?status=PENDING
     */
    @GetMapping("/appointments/count")
    public ResponseEntity<Integer> getAppointmentCount(
            @RequestParam String status,
            Authentication authentication) {
        String email = authentication.getName();
        String patientId = userService.getUserIdByEmail(email);
        Integer count = patientDashboardService.getAppointmentCount(patientId, status);
        return ResponseEntity.ok(count);
    }

    /**
     * Get completion rate
     * GET /api/patient/dashboard/completion-rate
     */
    @GetMapping("/completion-rate")
    public ResponseEntity<Double> getCompletionRate(Authentication authentication) {
        String email = authentication.getName();
        String patientId = userService.getUserIdByEmail(email);
        Double rate = patientDashboardService.getAppointmentCompletionRate(patientId);
        return ResponseEntity.ok(rate);
    }

    /**
     * Get prescription timeline
     * GET /api/patient/dashboard/prescriptions/timeline
     */
    @GetMapping("/prescriptions/timeline")
    public ResponseEntity<List<PatientPrescriptionDTO>> getPrescriptionTimeline(Authentication authentication) {
        String email = authentication.getName();
        String patientId = userService.getUserIdByEmail(email);
        List<PatientPrescriptionDTO> timeline = patientDashboardService.getPrescriptionTimeline(patientId);
        return ResponseEntity.ok(timeline);
    }
}
