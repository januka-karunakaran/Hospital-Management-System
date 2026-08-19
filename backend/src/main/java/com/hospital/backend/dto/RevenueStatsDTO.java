package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueStatsDTO {
    private double totalRevenue;
    private double monthlyRevenue;
    private double weeklyRevenue;
    private double dailyRevenue;
    private double avgConsultationFee;
    private long totalTransactions;
}
