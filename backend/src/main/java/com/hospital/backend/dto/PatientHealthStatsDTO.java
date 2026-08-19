package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientHealthStatsDTO {
    private Integer totalAppointments;
    private Integer completedAppointments;
    private Integer upcomingAppointments;
    private Integer cancelledAppointments;
    private Integer activePrescriptions;
    private Integer totalPrescriptions;
    private Double appointmentCompletionRate; // percentage
    private String lastAppointmentDate;
    private String nextAppointmentDate;
    private String nextAppointmentDoctor;
    private String nextAppointmentTime;
}
