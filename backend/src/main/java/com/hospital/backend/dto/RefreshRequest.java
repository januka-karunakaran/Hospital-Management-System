package com.hospital.backend.dto;

import lombok.Data;

@Data
public class RefreshRequest {
    private String refreshToken;
}