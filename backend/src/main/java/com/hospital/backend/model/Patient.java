package com.hospital.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

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
}