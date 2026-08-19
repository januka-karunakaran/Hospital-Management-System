package com.hospital.backend.service;

public interface PdfService {
    /**
     * Generate a PDF for the given prescription id and return the bytes.
     */
    byte[] generatePrescriptionPdf(String prescriptionId) throws Exception;
}
