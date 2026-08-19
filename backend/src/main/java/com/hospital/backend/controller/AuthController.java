package com.hospital.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.backend.dto.AuthResponse;
import com.hospital.backend.dto.ForgotPasswordRequest;
import com.hospital.backend.dto.LoginRequest;
import com.hospital.backend.dto.RefreshRequest;
import com.hospital.backend.dto.RefreshResponse;
import com.hospital.backend.dto.ResetPasswordRequest;
import com.hospital.backend.dto.SignupOtpRequest;
import com.hospital.backend.dto.SignupRequest;
import com.hospital.backend.model.RefreshToken;
import com.hospital.backend.model.User;
import com.hospital.backend.repository.UserRepository;
import com.hospital.backend.security.JwtService;
import com.hospital.backend.service.AuthService;
import com.hospital.backend.service.RefreshTokenService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/signup/send-otp")
    public ResponseEntity<String> sendSignupOtp(@Valid @RequestBody SignupOtpRequest request) {
        authService.sendSignupOtp(request.getEmail());
        return ResponseEntity.ok("Verification code sent");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok("If an account exists for that email, a reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getPassword());
        return ResponseEntity.ok("Password reset successfully");
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(@RequestBody RefreshRequest request) {

        RefreshToken refreshToken = refreshTokenService.verifyToken(request.getRefreshToken());

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newAccessToken = jwtService.generateToken(user, user.getRole().name());

        return ResponseEntity.ok(
                RefreshResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(request.getRefreshToken())
                        .build()
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestBody RefreshRequest request) {

        RefreshToken token = refreshTokenService.verifyToken(request.getRefreshToken());
        refreshTokenService.deleteByUserId(token.getUserId());

        return ResponseEntity.ok("Logged out successfully");
    }
}
