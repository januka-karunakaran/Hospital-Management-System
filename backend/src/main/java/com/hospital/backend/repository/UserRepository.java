package com.hospital.backend.repository;

import com.hospital.backend.enums.Role;
import com.hospital.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    long countByRole(Role role);
    
    // Search methods for doctors
    List<User> findBySpecializationContainingIgnoreCaseAndRoleOrderByFullNameAsc(String specialization, Role role);
    List<User> findByFullNameContainingIgnoreCaseAndRoleOrderByFullNameAsc(String fullName, Role role);
    List<User> findByRoleAndSpecializationOrderByFullNameAsc(Role role, String specialization);
}
