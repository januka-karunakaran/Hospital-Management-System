package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for doctor search results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchDoctorResponse {
    private String doctorId;
    private String name;
    private String email;
    private String specialization;
    private String phoneNumber;
    private Double avgRating;
    private Integer totalRatings;
    private Integer totalAppointments;
    private String photoUrl;
    private String bio;
    private String licenseNumber;
    private Long appointmentsThisMonth;
}
