package com.hospital.backend.service.impl;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.hospital.backend.dto.AuthResponse;
import com.hospital.backend.dto.LoginRequest;
import com.hospital.backend.dto.SignupRequest;
import com.hospital.backend.enums.Role;
import com.hospital.backend.exception.BadRequestException;
import com.hospital.backend.exception.DuplicateResourceException;
import com.hospital.backend.model.Doctor;
import com.hospital.backend.model.EmailVerificationCode;
import com.hospital.backend.model.PasswordResetToken;
import com.hospital.backend.model.Patient;
import com.hospital.backend.model.RefreshToken;
import com.hospital.backend.model.User;
import com.hospital.backend.repository.DoctorRepository;
import com.hospital.backend.repository.EmailVerificationCodeRepository;
import com.hospital.backend.repository.PasswordResetTokenRepository;
import com.hospital.backend.repository.PatientRepository;
import com.hospital.backend.repository.UserRepository;
import com.hospital.backend.security.JwtService;
import com.hospital.backend.service.AuthService;
import com.hospital.backend.service.RefreshTokenService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailVerificationCodeRepository emailVerificationCodeRepository;
    private final JavaMailSender mailSender;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public String signup(SignupRequest request) {
       String normalizedEmail = request.getEmail().trim().toLowerCase();
       if (userRepository.existsByEmail(normalizedEmail)) {
           throw new DuplicateResourceException("Email already exists");
    }

        EmailVerificationCode verification = emailVerificationCodeRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Request and verify an email code before signing up"));
        if (verification.getExpiresAt().isBefore(Instant.now())) {
            emailVerificationCodeRepository.delete(verification);
            throw new BadRequestException("Verification code has expired. Request a new code");
        }
        if (verification.getFailedAttempts() >= 5) {
            emailVerificationCodeRepository.delete(verification);
            throw new BadRequestException("Too many incorrect attempts. Request a new code");
        }
        if (!verification.getCodeHash().equals(hashToken(normalizedEmail + ":" + request.getOtp()))) {
            verification.setFailedAttempts(verification.getFailedAttempts() + 1);
            emailVerificationCodeRepository.save(verification);
            throw new BadRequestException("Incorrect verification code");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.valueOf(request.getRole().toUpperCase()))
                .build();

        user = userRepository.save(user);

        if (user.getRole() == Role.DOCTOR) {
            Doctor doctor = Doctor.builder()
                    .id(user.getId())
                    .userId(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .specialization(user.getSpecialization() != null
                            ? user.getSpecialization()
                            : "General Medicine")
                    .status("ACTIVE")
                    .build();
            doctorRepository.save(doctor);
        } else if (user.getRole() == Role.PATIENT) {
            Patient patient = Patient.builder()
                    .userId(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .phone(user.getPhoneNumber())
                    .address(user.getAddress())
                    .build();
            patientRepository.save(patient);
        }
        emailVerificationCodeRepository.deleteByEmail(normalizedEmail);
        return "Signup successful";
    }

    @Override
    public void sendSignupOtp(String email) {
        requireMailConfiguration();
        String normalizedEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("An account already exists for this email");
        }

        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        emailVerificationCodeRepository.deleteByEmail(normalizedEmail);
        emailVerificationCodeRepository.save(EmailVerificationCode.builder()
                .email(normalizedEmail)
                .codeHash(hashToken(normalizedEmail + ":" + otp))
                .failedAttempts(0)
                .expiresAt(Instant.now().plus(Duration.ofMinutes(10)))
                .build());

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(normalizedEmail);
        message.setSubject("Your MediCore HMS verification code");
        message.setText("Your MediCore HMS signup verification code is: " + otp
                + "\n\nThis code expires in 10 minutes. Do not share it with anyone.");
        mailSender.send(message);
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        String accessToken = jwtService.generateToken(user, user.getRole().name());

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken.getToken())
                .role(user.getRole().name())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .userId(user.getId())
                .build();
    }

    @Override
    public void requestPasswordReset(String email) {
        requireMailConfiguration();
        userRepository.findByEmailIgnoreCase(email.trim()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUserId(user.getId());

            String rawToken = UUID.randomUUID() + "-" + UUID.randomUUID();
            passwordResetTokenRepository.save(PasswordResetToken.builder()
                    .tokenHash(hashToken(rawToken))
                    .userId(user.getId())
                    .expiresAt(Instant.now().plus(Duration.ofMinutes(30)))
                    .build());

            String resetUrl = frontendUrl + "/reset-password?token=" + rawToken;
            if (mailEnabled) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(mailFrom);
                message.setTo(user.getEmail());
                message.setSubject("Reset your MediCore HMS password");
                message.setText("Hello " + user.getFullName() + ",\n\nUse this link to reset your password. "
                        + "It expires in 30 minutes:\n" + resetUrl
                        + "\n\nIf you did not request this, you can ignore this email.");
                mailSender.send(message);
            }
        });
    }

    @Override
    public void resetPassword(String token, String password) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(hashToken(token))
                .orElseThrow(() -> new BadRequestException("This reset link is invalid or has expired"));

        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("This reset link is invalid or has expired");
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new BadRequestException("This reset link is invalid or has expired"));
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
        passwordResetTokenRepository.deleteByUserId(user.getId());
        refreshTokenService.deleteByUserId(user.getId());
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    private void requireMailConfiguration() {
        if (!mailEnabled || mailFrom == null || mailFrom.isBlank()) {
            throw new BadRequestException("Email service is not configured. Check the backend .env mail settings");
        }
    }
}
