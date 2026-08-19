package com.hospital.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "medicine_reminders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineReminder {
    @Id
    private String id;
    private String patientId;
    private String medicineName;
    private List<String> times; // ["08:00", "14:00", "20:00"]
    private String startDate;
    private String endDate;
    private boolean isActive;
    private boolean notifyEmail;
    private boolean notifySMS;
}
