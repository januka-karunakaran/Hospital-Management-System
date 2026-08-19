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
public class PatientDashboardSummaryDTO {
    private PatientHealthStatsDTO healthStats;
    private List<PatientAppointmentDTO> upcomingAppointments; // Next 5
    private List<PatientAppointmentDTO> pastAppointments; // Last 5
    private List<PatientPrescriptionDTO> activePrescriptions;
    private List<PatientPrescriptionDTO> recentPrescriptions; // Last 5
    private Integer totalNotifications;
    private Integer unreadNotifications;
}
