package com.hospital.backend.service.impl;

import com.hospital.backend.model.Invoice;
import com.hospital.backend.repository.InvoiceRepository;
import com.hospital.backend.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;

    @Override
    public Invoice createInvoice(Invoice invoice) {
        if (invoice.getInvoiceNumber() == null) {
            invoice.setInvoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (invoice.getDate() == null) {
            invoice.setDate(LocalDate.now().toString());
        }
        if (invoice.getStatus() == null) {
            invoice.setStatus("UNPAID");
        }
        
        // Calculate total
        double subtotal = invoice.getItems().stream()
                .mapToDouble(Invoice.InvoiceItem::getTotal)
                .sum();
        invoice.setSubtotal(subtotal);
        
        double tax = subtotal * 0.1; // 10% tax
        invoice.setTax(tax);
        
        double total = subtotal + tax - (invoice.getDiscount() != null ? invoice.getDiscount() : 0);
        invoice.setTotalAmount(total);

        return invoiceRepository.save(invoice);
    }

    @Override
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    @Override
    public List<Invoice> getPatientInvoices(String patientId) {
        return invoiceRepository.findByPatientId(patientId);
    }

    @Override
    public Invoice getInvoiceById(String id) {
        return invoiceRepository.findById(id).orElseThrow(() -> new RuntimeException("Invoice not found"));
    }

    @Override
    public Invoice updateInvoiceStatus(String id, String status) {
        Invoice invoice = getInvoiceById(id);
        invoice.setStatus(status);
        return invoiceRepository.save(invoice);
    }
}
