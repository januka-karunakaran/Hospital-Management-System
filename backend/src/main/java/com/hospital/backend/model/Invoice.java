package com.hospital.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {
    @Id
    private String id;
    private String invoiceNumber;
    private String patientId;
    private String patientName;
    private String date;
    private List<InvoiceItem> items;
    private Double subtotal;
    private Double tax;
    private Double discount;
    private Double totalAmount;
    private String status; // PAID, UNPAID, CANCELLED
    private String paymentMethod; // CASH, CARD, INSURANCE
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvoiceItem {
        private String description;
        private Integer quantity;
        private Double unitPrice;
        private Double total;
    }
}
