package com.hospital.backend.service;

import com.hospital.backend.dto.AuthResponse;
import com.hospital.backend.dto.LoginRequest;
import com.hospital.backend.dto.SignupRequest;

public interface AuthService {
    String signup(SignupRequest request);
    AuthResponse login(LoginRequest request);
}