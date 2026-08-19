package com.hospital.backend.controller;

import com.hospital.backend.model.User;
import com.hospital.backend.model.AuditLog;
import com.hospital.backend.service.AdminService;
import com.hospital.backend.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final AuditService auditService;

    @GetMapping("/staff")
    public ResponseEntity<List<User>> getAllStaff() {
        return ResponseEntity.ok(adminService.getAllStaff());
    }

    @PatchMapping("/staff/{userId}/role")
    public ResponseEntity<User> updateRole(@PathVariable String userId, @RequestParam String role) {
        return ResponseEntity.ok(adminService.updateStaffRole(userId, role));
    }

    @DeleteMapping("/staff/{userId}")
    public ResponseEntity<String> deleteStaff(@PathVariable String userId) {
        adminService.deleteStaff(userId);
        return ResponseEntity.ok("Staff member deleted");
    }

    @GetMapping("/doctors/pending")
    public ResponseEntity<List<User>> getPendingDoctors() {
        return ResponseEntity.ok(adminService.getPendingDoctors());
    }

    @PostMapping("/doctors/{userId}/approve")
    public ResponseEntity<User> approveDoctor(@PathVariable String userId) {
        return ResponseEntity.ok(adminService.approveDoctor(userId));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditService.getRecentLogs());
    }
}
