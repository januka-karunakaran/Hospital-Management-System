package com.hospital.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileUpdateRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Email should be valid")
    private String email;

    private String phoneNumber;

    private String address;

    private String city;

    private String state;

    private String zipCode;

    private String photoUrl;

    private String bio;

    // For doctors
    private String specialization;

    private String licenseNumber;
}
