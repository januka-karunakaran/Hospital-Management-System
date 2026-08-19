package com.hospital.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "beds")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bed {
    @Id
    private String id;
    private String bedNumber;
    private String type; // GENERAL, ICU, SEMI_PRIVATE, PRIVATE
    private String status; // AVAILABLE, OCCUPIED, MAINTENANCE
    private Double pricePerDay;
    private String ward;
}
