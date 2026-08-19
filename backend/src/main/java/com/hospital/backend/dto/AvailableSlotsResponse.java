package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotsResponse {
    private String doctorId;
    private String date;
    private boolean scheduleConfigured;
    private boolean available;
    private List<String> availableSlots;
    private List<String> bookedSlots;
    private int bookedPatientCount;
    private String reason;
}
