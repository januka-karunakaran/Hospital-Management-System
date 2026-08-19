package com.hospital.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorAvailabilityDTO {
    private String id;
    private String doctorId;
    private String dayOfWeek;
    private String date;
    private List<String> timeSlots;
    @JsonProperty("isAvailable")
    @JsonAlias("available")
    private boolean isAvailable;
    private String reason;
}
