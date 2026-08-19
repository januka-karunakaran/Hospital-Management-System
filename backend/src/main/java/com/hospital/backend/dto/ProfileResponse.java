package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {

    private String id;

    private String fullName;

    private String email;

    private String role;

    private String phoneNumber;

    private String address;

    private String city;

    private String state;

    private String zipCode;

    private String photoUrl;

    private String bio;

    private String specialization; // For doctors

    private String licenseNumber;  // For doctors
}
