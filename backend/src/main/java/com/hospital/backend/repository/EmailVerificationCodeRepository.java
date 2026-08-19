package com.hospital.backend.repository;

import java.util.Optional;

import com.hospital.backend.model.EmailVerificationCode;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EmailVerificationCodeRepository extends MongoRepository<EmailVerificationCode, String> {
    Optional<EmailVerificationCode> findByEmail(String email);
    void deleteByEmail(String email);
}
