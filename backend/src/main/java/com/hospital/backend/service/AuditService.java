package com.hospital.backend.service;

import com.hospital.backend.model.AuditLog;
import java.util.List;

public interface AuditService {
    void log(String userId, String userName, String action, String details);
    List<AuditLog> getRecentLogs();
}
