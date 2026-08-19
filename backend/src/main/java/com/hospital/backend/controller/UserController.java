package com.hospital.backend.controller;

import com.hospital.backend.dto.ProfileResponse;
import com.hospital.backend.dto.ProfileUpdateRequest;
import com.hospital.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private final UserService userService;

    /**
     * Get current user's profile
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> getMyProfile(Authentication authentication) {
        // Extract email from authentication (JWT subject is email)
        String email = authentication.getName();
        String userId = userService.getUserIdByEmail(email);
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    /**
     * Get user profile by ID
     */
    @GetMapping("/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> getUserProfile(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    /**
     * Update current user's profile
     */
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileUpdateRequest request) {
        String email = authentication.getName();
        String userId = userService.getUserIdByEmail(email);
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    /**
     * Update specific user's profile (Admin only)
     */
    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProfileResponse> updateUserProfile(
            @PathVariable String userId,
            @Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }
}
