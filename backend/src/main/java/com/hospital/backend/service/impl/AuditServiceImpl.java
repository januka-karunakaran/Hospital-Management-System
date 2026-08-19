package com.hospital.backend.service.impl;

import com.hospital.backend.model.AuditLog;
import com.hospital.backend.repository.AuditLogRepository;
import com.hospital.backend.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public void log(String userId, String userName, String action, String details) {
        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .userName(userName)
                .action(action)
                .details(details)
                .timestamp(LocalDateTime.now().toString())
                .build();
        auditLogRepository.save(auditLog);
    }

    @Override
    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
}
