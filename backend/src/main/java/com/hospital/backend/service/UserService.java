package com.hospital.backend.service;

import com.hospital.backend.dto.ProfileResponse;
import com.hospital.backend.dto.ProfileUpdateRequest;

public interface UserService {
    ProfileResponse getProfile(String userId);
    ProfileResponse updateProfile(String userId, ProfileUpdateRequest request);
    ProfileResponse getUserById(String userId);
    String getUserIdByEmail(String email);
}

