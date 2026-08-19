package com.hospital.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    private String userId;

    private String fullName;
    private String email;
    private String phone;
    private Integer age;
    private String gender;
    private String bloodGroup;
    private String address;

    private List<FamilyMember> familyMembers;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FamilyMember {
        private String id;
        private String fullName;
        private String relation; // SPOUSE, CHILD, PARENT, etc.
        private Integer age;
        private String gender;
        private String bloodGroup;
    }
}