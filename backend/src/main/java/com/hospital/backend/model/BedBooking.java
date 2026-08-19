package com.hospital.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bed_bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BedBooking {
    @Id
    private String id;
    private String bedId;
    private String patientId;
    private String doctorId;
    private String admissionDate;
    private String dischargeDate;
    private String status; // ACTIVE, DISCHARGED
    private String notes;
}
