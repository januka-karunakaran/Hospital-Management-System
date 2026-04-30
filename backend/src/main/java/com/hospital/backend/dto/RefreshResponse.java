package com.hospital.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RefreshResponse {
    private String accessToken;
    private String refreshToken;
}