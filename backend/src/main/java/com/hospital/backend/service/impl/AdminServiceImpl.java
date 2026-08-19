package com.hospital.backend.service.impl;

import com.hospital.backend.enums.Role;
import com.hospital.backend.model.User;
import com.hospital.backend.repository.UserRepository;
import com.hospital.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;

    @Override
    public List<User> getAllStaff() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() != Role.PATIENT && user.getRole() != Role.ADMIN)
                .collect(Collectors.toList());
    }

    @Override
    public User updateStaffRole(String userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(Role.valueOf(role));
        return userRepository.save(user);
    }

    @Override
    public void deleteStaff(String userId) {
        userRepository.deleteById(userId);
    }

    @Override
    public List<User> getPendingDoctors() {
        // Assuming there's an 'isApproved' field or similar logic
        // For now, let's just return all doctors who might need review
        return userRepository.findByRole(Role.DOCTOR);
    }

    @Override
    public User approveDoctor(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        // logic for approval (e.g. setting a flag)
        return user;
    }
}
