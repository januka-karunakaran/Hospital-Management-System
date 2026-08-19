package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyMetricsDTO {
    private LocalDate date;
    private long appointmentCount;
    private long newPatients;
    private long newPrescriptions;
    private double revenue;
}
