package com.hospital.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {
    @Id
    private String id;
    private String name;
    private String category; // MEDICINE, EQUIPMENT, DISPOSABLE
    private Integer stockLevel;
    private Integer reorderLevel;
    private String unit; // PCS, BOX, MG, ML
    private Double unitPrice;
    private String supplier;
    private String expiryDate;
}
