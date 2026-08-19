package com.hospital.backend.service.impl;

import com.hospital.backend.service.MailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    // ─── Appointment Confirmed ────────────────────────────────────────────────

    @Override
    @Async
    public void sendAppointmentConfirmedToPatient(
            String toEmail, String patientName,
            String doctorName, String date, String time) {
        if (!canSend()) return;
        String subject = "✅ Appointment Confirmed — MediCore HMS";
        String html = baseTemplate(
                "Appointment Confirmed",
                "Hello " + patientName + ",",
                "Your appointment has been successfully booked.",
                new String[][]{
                        {"Doctor", "Dr. " + doctorName},
                        {"Date", date},
                        {"Time", time}
                },
                "#22c55e",
                "Please arrive 10 minutes early with any relevant documents.",
                "View My Appointments",
                "http://localhost:3000/patient/appointments"
        );
        send(toEmail, subject, html);
    }

    @Override
    @Async
    public void sendAppointmentConfirmedToDoctor(
            String toEmail, String doctorName,
            String patientName, String date, String time) {
        if (!canSend()) return;
        String subject = "📅 New Appointment — MediCore HMS";
        String html = baseTemplate(
                "New Appointment Scheduled",
                "Hello Dr. " + doctorName + ",",
                "A new appointment has been booked with you.",
                new String[][]{
                        {"Patient", patientName},
                        {"Date", date},
                        {"Time", time}
                },
                "#3b82f6",
                "Please review patient details before the appointment.",
                "View Appointments",
                "http://localhost:3000/doctor/appointments"
        );
        send(toEmail, subject, html);
    }

    // ─── Appointment Cancelled ────────────────────────────────────────────────

    @Override
    @Async
    public void sendAppointmentCancelledToPatient(
            String toEmail, String patientName,
            String doctorName, String date, String time) {
        if (!canSend()) return;
        String subject = "❌ Appointment Cancelled — MediCore HMS";
        String html = baseTemplate(
                "Appointment Cancelled",
                "Hello " + patientName + ",",
                "Your appointment has been cancelled.",
                new String[][]{
                        {"Doctor", "Dr. " + doctorName},
                        {"Date", date},
                        {"Time", time}
                },
                "#ef4444",
                "You can book a new appointment anytime through the portal.",
                "Book New Appointment",
                "http://localhost:3000/search"
        );
        send(toEmail, subject, html);
    }

    @Override
    @Async
    public void sendAppointmentCancelledToDoctor(
            String toEmail, String doctorName,
            String patientName, String date, String time) {
        if (!canSend()) return;
        String subject = "❌ Appointment Cancelled — MediCore HMS";
        String html = baseTemplate(
                "Appointment Cancelled",
                "Hello Dr. " + doctorName + ",",
                "An appointment has been cancelled.",
                new String[][]{
                        {"Patient", patientName},
                        {"Date", date},
                        {"Time", time}
                },
                "#ef4444",
                "Your schedule has been updated automatically.",
                "View Schedule",
                "http://localhost:3000/doctor/appointments"
        );
        send(toEmail, subject, html);
    }

    // ─── Appointment Updated ──────────────────────────────────────────────────

    @Override
    @Async
    public void sendAppointmentUpdatedToPatient(
            String toEmail, String patientName,
            String doctorName, String newStatus) {
        if (!canSend()) return;
        String subject = "🔔 Appointment Update — MediCore HMS";
        String html = baseTemplate(
                "Appointment Status Updated",
                "Hello " + patientName + ",",
                "Your appointment status has been updated.",
                new String[][]{
                        {"Doctor", "Dr. " + doctorName},
                        {"New Status", newStatus}
                },
                "#f59e0b",
                "Log in to the portal to view full appointment details.",
                "View Appointments",
                "http://localhost:3000/patient/appointments"
        );
        send(toEmail, subject, html);
    }

    // ─── Prescription Ready ───────────────────────────────────────────────────

    @Override
    @Async
    public void sendPrescriptionReadyToPatient(
            String toEmail, String patientName, String doctorName, String diagnosis) {
        if (!canSend()) return;
        String subject = "💊 New Prescription — MediCore HMS";
        String html = baseTemplate(
                "New Prescription Issued",
                "Hello " + patientName + ",",
                "Dr. " + doctorName + " has issued a new prescription for you.",
                new String[][]{
                        {"Doctor", "Dr. " + doctorName},
                        {"Diagnosis", diagnosis != null && !diagnosis.isBlank() ? diagnosis : "—"}
                },
                "#8b5cf6",
                "Please follow the dosage instructions carefully. Contact your doctor if you have any questions.",
                "View My Prescriptions",
                "http://localhost:3000/patient/my-prescriptions"
        );
        send(toEmail, subject, html);
    }

    // ─── Internal helpers ─────────────────────────────────────────────────────

    private boolean canSend() {
        return mailEnabled && mailFrom != null && !mailFrom.isBlank();
    }

    private void send(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(mailFrom, "MediCore HMS");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("Mail sent to {} — {}", to, subject);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    /**
     * Single reusable HTML email template with MediCore branding.
     *
     * @param heading     Large bold title
     * @param greeting    First line (Hello ...)
     * @param intro       Intro sentence
     * @param rows        Info rows: [["Label", "Value"], ...]
     * @param accentColor Hex color for the top border & badge
     * @param footer      Footer hint text
     * @param ctaLabel    Call-to-action button text
     * @param ctaUrl      Call-to-action button URL
     */
    private String baseTemplate(
            String heading, String greeting, String intro,
            String[][] rows, String accentColor,
            String footer, String ctaLabel, String ctaUrl) {

        StringBuilder rowsHtml = new StringBuilder();
        for (String[] row : rows) {
            rowsHtml.append("""
                    <tr>
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;width:120px;vertical-align:top">%s</td>
                      <td style="padding:10px 0;color:#f1f5f9;font-size:14px;font-weight:600">%s</td>
                    </tr>
                    """.formatted(row[0], escapeHtml(row[1])));
        }

        return """
                <!DOCTYPE html>
                <html lang="en">
                <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
                <body style="margin:0;padding:0;background:#0a0e1a;font-family:'Helvetica Neue',Arial,sans-serif">
                  <table width="100%%" cellpadding="0" cellspacing="0">
                    <tr><td align="center" style="padding:40px 16px">
                      <table width="100%%" cellpadding="0" cellspacing="0" style="max-width:560px">

                        <!-- Header -->
                        <tr><td style="background:linear-gradient(135deg,#0d1b4b,#0a2b5e);border-radius:16px 16px 0 0;padding:32px 36px;border-top:4px solid %s">
                          <table width="100%%">
                            <tr>
                              <td>
                                <div style="display:inline-flex;align-items:center;gap:10px">
                                  <span style="display:inline-block;width:36px;height:36px;background:linear-gradient(135deg,#3b82f6,#06b6d4);border-radius:10px;text-align:center;line-height:36px;font-size:18px">🏥</span>
                                  <span style="color:#fff;font-size:18px;font-weight:700;vertical-align:middle">MediCore HMS</span>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td></tr>

                        <!-- Body -->
                        <tr><td style="background:#0f172a;padding:36px 36px 28px">
                          <h1 style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px">%s</h1>
                          <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6">%s<br>%s</p>

                          <!-- Info table -->
                          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:4px 20px;margin-bottom:28px">
                            <table width="100%%" cellpadding="0" cellspacing="0">
                              %s
                            </table>
                          </div>

                          <!-- CTA -->
                          <a href="%s" style="display:block;text-align:center;background:linear-gradient(135deg,#2563eb,#0284c7);color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:15px 24px;border-radius:12px;margin-bottom:24px">
                            %s
                          </a>

                          <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;text-align:center">%s</p>
                        </td></tr>

                        <!-- Footer -->
                        <tr><td style="background:#080d19;border-radius:0 0 16px 16px;padding:20px 36px;border-top:1px solid rgba(255,255,255,0.06)">
                          <p style="margin:0;color:#475569;font-size:11px;text-align:center;line-height:1.6">
                            This email was sent by MediCore HMS · Do not reply to this email<br>
                            &copy; 2025 MediCore HMS. All rights reserved.
                          </p>
                        </td></tr>

                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(
                accentColor, heading, greeting, intro,
                rowsHtml, ctaUrl, ctaLabel, footer);
    }

    private String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
