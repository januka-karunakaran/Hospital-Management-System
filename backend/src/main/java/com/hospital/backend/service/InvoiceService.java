package com.hospital.backend.service;

import com.hospital.backend.model.Invoice;
import java.util.List;

public interface InvoiceService {
    Invoice createInvoice(Invoice invoice);
    List<Invoice> getAllInvoices();
    List<Invoice> getPatientInvoices(String patientId);
    Invoice getInvoiceById(String id);
    Invoice updateInvoiceStatus(String id, String status);
}
