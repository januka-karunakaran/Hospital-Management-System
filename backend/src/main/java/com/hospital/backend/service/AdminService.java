package com.hospital.backend.service;

import com.hospital.backend.dto.ProfileResponse;
import com.hospital.backend.model.User;
import java.util.List;

public interface AdminService {
    List<User> getAllStaff();
    User updateStaffRole(String userId, String role);
    void deleteStaff(String userId);
    List<User> getPendingDoctors();
    User approveDoctor(String userId);
}
