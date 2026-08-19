package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for searching doctors with various criteria
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchDoctorRequest {
    private String searchTerm;           // Name or specialization keyword
    private String specialization;       // Exact specialization match
    private Double minRating;            // Minimum average rating (0-5)
    private String sortBy;               // "rating", "name", "experience", "appointments"
    private String sortOrder;            // "asc" or "desc"
    private Integer limit;               // Max results (default 10)
    private Integer offset;              // For pagination (default 0)
}
