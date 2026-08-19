package com.hospital.backend.model;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "email_verification_codes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationCode {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String codeHash;
    private int failedAttempts;

    @Indexed(expireAfter = "0s")
    private Instant expiresAt;
}
