package com.hospital.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "availability")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Availability {
    @Id
    private String id;
    private String doctorId;
    private String dayOfWeek; // MONDAY, TUESDAY, etc.
    private String date; // Specific date for leave or special slots
    private List<String> timeSlots; // ["09:00", "09:30", ...]
    private boolean isAvailable; // false for leave
    private String reason; // for leave
}
