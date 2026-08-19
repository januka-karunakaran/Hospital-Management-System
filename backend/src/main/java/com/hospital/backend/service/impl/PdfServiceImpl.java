package com.hospital.backend.service.impl;

import com.hospital.backend.model.Prescription;
import com.hospital.backend.model.User;
import com.hospital.backend.repository.PrescriptionRepository;
import com.hospital.backend.repository.UserRepository;
import com.hospital.backend.service.PdfService;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PdfServiceImpl implements PdfService {

    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;

    @Override
    public byte[] generatePrescriptionPdf(String prescriptionId) throws Exception {
        Prescription presc = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Prescription not found: " + prescriptionId));

        User doctor = userRepository.findById(presc.getDoctorId()).orElse(null);
        User patient = userRepository.findById(presc.getPatientId()).orElse(null);

        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);

            PDPageContentStream contents = new PDPageContentStream(doc, page);
            contents.setLeading(14.5f);

            // Header
            contents.beginText();
            contents.setFont(PDType1Font.HELVETICA_BOLD, 16);
            contents.newLineAtOffset(50, 700);
            contents.showText("Prescription");
            contents.endText();

            // Doctor info
            contents.beginText();
            contents.setFont(PDType1Font.HELVETICA, 11);
            contents.newLineAtOffset(50, 680);
            String docName = doctor != null ? ("Dr. " + doctor.getFullName()) : "Unknown Doctor";
            contents.showText("Prescribed By: " + docName);
            contents.newLine();
            if (doctor != null && doctor.getSpecialization() != null) {
                contents.showText("Specialization: " + doctor.getSpecialization());
                contents.newLine();
            }
            if (doctor != null && doctor.getPhoneNumber() != null) {
                contents.showText("Contact: " + doctor.getPhoneNumber());
                contents.newLine();
            }
            contents.endText();

            // Patient info
            contents.beginText();
            contents.setFont(PDType1Font.HELVETICA, 11);
            contents.newLineAtOffset(50, 620);
            String patName = patient != null ? patient.getFullName() : "Unknown Patient";
            contents.showText("Patient: " + patName);
            contents.newLine();
            if (presc.getCreatedAt() != null) {
                contents.showText("Date: " + presc.getCreatedAt());
                contents.newLine();
            }
            contents.endText();

            // Medicines and instructions
            contents.beginText();
            contents.setFont(PDType1Font.HELVETICA_BOLD, 12);
            contents.newLineAtOffset(50, 580);
            contents.showText("Medicines:");
            contents.endText();

            contents.beginText();
            contents.setFont(PDType1Font.HELVETICA, 11);
            contents.newLineAtOffset(60, 560);
            String meds = presc.getMedicines() != null ? presc.getMedicines().toString() : "";
            // Wrap text roughly
            for (String line : wrapText(meds, 80)) {
                contents.showText(line);
                contents.newLine();
            }
            contents.endText();

            // Dosage
            if (presc.getDosageInstructions() != null) {
                contents.beginText();
                contents.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contents.newLineAtOffset(50, 460);
                contents.showText("Dosage Instructions:");
                contents.endText();

                contents.beginText();
                contents.setFont(PDType1Font.HELVETICA, 11);
                contents.newLineAtOffset(60, 440);
                for (String line : wrapText(presc.getDosageInstructions(), 80)) {
                    contents.showText(line);
                    contents.newLine();
                }
                contents.endText();
            }

            // Notes
            if (presc.getNotes() != null) {
                contents.beginText();
                contents.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contents.newLineAtOffset(50, 380);
                contents.showText("Notes:");
                contents.endText();

                contents.beginText();
                contents.setFont(PDType1Font.HELVETICA, 11);
                contents.newLineAtOffset(60, 360);
                for (String line : wrapText(presc.getNotes(), 80)) {
                    contents.showText(line);
                    contents.newLine();
                }
                contents.endText();
            }

            contents.close();

            doc.save(out);
            return out.toByteArray();
        }
    }

    private java.util.List<String> wrapText(String text, int maxChars) {
        java.util.List<String> lines = new java.util.ArrayList<>();
        if (text == null || text.isEmpty()) return lines;
        String[] words = text.split("\\s+");
        StringBuilder line = new StringBuilder();
        for (String w : words) {
            if (line.length() + w.length() + 1 > maxChars) {
                lines.add(line.toString());
                line = new StringBuilder();
            }
            if (line.length() > 0) line.append(' ');
            line.append(w);
        }
        if (line.length() > 0) lines.add(line.toString());
        return lines;
    }
}
