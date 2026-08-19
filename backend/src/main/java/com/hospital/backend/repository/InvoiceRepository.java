package com.hospital.backend.repository;

import com.hospital.backend.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    List<Invoice> findByPatientId(String patientId);
    List<Invoice> findByStatus(String status);
}
