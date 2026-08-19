package com.hospital.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SignupRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Enter a valid email")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Role is required")
    private String role;

    @NotBlank(message = "Email verification code is required")
    @Pattern(regexp = "\\d{6}", message = "Verification code must contain 6 digits")
    private String otp;
}
