package com.hospital.backend.service;

import com.hospital.backend.dto.*;

import java.util.List;

public interface PatientDashboardService {

    // Get complete patient dashboard
    PatientDashboardSummaryDTO getPatientDashboard(String patientId);

    // Get patient health statistics
    PatientHealthStatsDTO getPatientHealthStats(String patientId);

    // Get upcoming appointments (next N days)
    List<PatientAppointmentDTO> getUpcomingAppointments(String patientId, Integer limit);

    // Get past appointments
    List<PatientAppointmentDTO> getPastAppointments(String patientId, Integer limit);

    // Get all appointments for patient
    List<PatientAppointmentDTO> getAllAppointments(String patientId);

    // Get active prescriptions
    List<PatientPrescriptionDTO> getActivePrescriptions(String patientId);

    // Get recent prescriptions
    List<PatientPrescriptionDTO> getRecentPrescriptions(String patientId, Integer limit);

    // Get prescription status
    String getPrescriptionStatus(String prescriptionId);

    // Get appointment count by status
    Integer getAppointmentCount(String patientId, String status);

    // Get completion rate
    Double getAppointmentCompletionRate(String patientId);

    // Get next appointment details
    PatientAppointmentDTO getNextAppointment(String patientId);

    // Get appointment history (for charting)
    List<Object> getAppointmentHistory(String patientId, Integer days);

    // Get prescription timeline
    List<PatientPrescriptionDTO> getPrescriptionTimeline(String patientId);
}
