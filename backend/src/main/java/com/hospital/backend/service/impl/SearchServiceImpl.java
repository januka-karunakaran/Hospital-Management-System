package com.hospital.backend.service.impl;

import com.hospital.backend.dto.*;
import com.hospital.backend.enums.Role;
import com.hospital.backend.model.Appointment;
import com.hospital.backend.model.Doctor;
import com.hospital.backend.model.Prescription;
import com.hospital.backend.model.User;
import com.hospital.backend.repository.AppointmentRepository;
import com.hospital.backend.repository.DoctorRepository;
import com.hospital.backend.repository.PrescriptionRepository;
import com.hospital.backend.repository.UserRepository;
import com.hospital.backend.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {
    
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    
    @Override
    public SearchResultsWrapper<SearchDoctorResponse> searchDoctors(SearchDoctorRequest request) {
        try {
            // Get all doctors
            List<User> allDoctors = userRepository.findByRole(Role.DOCTOR);
            
            // Apply filters
            List<SearchDoctorResponse> filtered = allDoctors.stream()
                .filter(doctor -> {
                    // Search term filter (name or specialization)
                    if (request.getSearchTerm() != null && !request.getSearchTerm().isEmpty()) {
                        String term = request.getSearchTerm().toLowerCase();
                        String fullName = (doctor.getFullName() != null ? doctor.getFullName() : "").toLowerCase();
                        String spec = doctor.getSpecialization() != null ? doctor.getSpecialization().toLowerCase() : "";
                        if (!fullName.contains(term) && !spec.contains(term)) {
                            return false;
                        }
                    }
                    
                    // Specialization filter
                    if (request.getSpecialization() != null && !request.getSpecialization().isEmpty()) {
                        if (!request.getSpecialization().equalsIgnoreCase(doctor.getSpecialization())) {
                            return false;
                        }
                    }
                    
                    // Minimum rating filter
                    if (request.getMinRating() != null) {
                        Doctor doc = doctorRepository.findById(doctor.getId()).orElse(null);
                        if (doc == null || doc.getRating() == null || doc.getRating() < request.getMinRating()) {
                            return false;
                        }
                    }
                    
                    return true;
                })
                .map(this::convertUserToSearchDoctorResponse)
                .collect(Collectors.toList());
            
            // Apply sorting
            if (request.getSortBy() != null) {
                filtered = sortDoctors(filtered, request.getSortBy(), request.getSortOrder());
            } else {
                // Default sort by name
                filtered.sort(Comparator.comparing(SearchDoctorResponse::getName));
            }
            
            // Apply pagination
            Integer limit = request.getLimit() != null ? request.getLimit() : 10;
            Integer offset = request.getOffset() != null ? request.getOffset() : 0;
            
            List<SearchDoctorResponse> paginated = filtered.stream()
                .skip(offset)
                .limit(limit)
                .collect(Collectors.toList());
            
            // Calculate pagination info
            Integer totalCount = filtered.size();
            Integer pageNumber = (offset / limit) + 1;
            Integer totalPages = (int) Math.ceil((double) totalCount / limit);
            Boolean hasMore = (offset + limit) < totalCount;
            
            return SearchResultsWrapper.<SearchDoctorResponse>builder()
                .data(paginated)
                .totalCount(totalCount)
                .limit(limit)
                .offset(offset)
                .pageNumber(pageNumber)
                .totalPages(totalPages)
                .hasMore(hasMore)
                .build();
        } catch (Exception e) {
            System.err.println("Error searching doctors: " + e.getMessage());
            return SearchResultsWrapper.<SearchDoctorResponse>builder()
                .data(new ArrayList<>())
                .totalCount(0)
                .build();
        }
    }
    
    @Override
    public SearchResultsWrapper<SearchDoctorResponse> searchDoctorsBySpecialization(String specialization) {
        SearchDoctorRequest request = SearchDoctorRequest.builder()
            .specialization(specialization)
            .limit(10)
            .offset(0)
            .build();
        return searchDoctors(request);
    }
    
    @Override
    public SearchResultsWrapper<SearchDoctorResponse> searchDoctorsByName(String name) {
        SearchDoctorRequest request = SearchDoctorRequest.builder()
            .searchTerm(name)
            .limit(10)
            .offset(0)
            .build();
        return searchDoctors(request);
    }

    @Override
    public SearchResultsWrapper<ProfileResponse> searchPatients(String searchTerm) {
        try {
            List<User> allPatients = userRepository.findByRole(Role.PATIENT);
            String term = searchTerm != null ? searchTerm.toLowerCase() : "";
            
            List<ProfileResponse> filtered = allPatients.stream()
                .filter(p -> {
                    String name = p.getFullName() != null ? p.getFullName().toLowerCase() : "";
                    String email = p.getEmail() != null ? p.getEmail().toLowerCase() : "";
                    String phone = p.getPhoneNumber() != null ? p.getPhoneNumber().toLowerCase() : "";
                    return name.contains(term) || email.contains(term) || phone.contains(term);
                })
                .map(this::convertUserToProfileResponse)
                .collect(Collectors.toList());
            
            return SearchResultsWrapper.<ProfileResponse>builder()
                .data(filtered)
                .totalCount(filtered.size())
                .build();
        } catch (Exception e) {
            return SearchResultsWrapper.<ProfileResponse>builder().data(new ArrayList<>()).totalCount(0).build();
        }
    }
    
    @Override
    public SearchResultsWrapper<?> filterAppointments(AppointmentFilterRequest request) {
        try {
            List<Appointment> allAppointments = appointmentRepository.findAll();
            
            // Apply filters
            List<AppointmentFilterResponse> filtered = allAppointments.stream()
                .filter(appt -> {
                    // Status filter
                    if (request.getStatus() != null && !request.getStatus().isEmpty()) {
                        if (!request.getStatus().equalsIgnoreCase(appt.getStatus())) {
                            return false;
                        }
                    }
                    
                    // Doctor ID filter
                    if (request.getDoctorId() != null && !request.getDoctorId().isEmpty()) {
                        if (!request.getDoctorId().equals(appt.getDoctorId())) {
                            return false;
                        }
                    }
                    
                    // Patient ID filter
                    if (request.getPatientId() != null && !request.getPatientId().isEmpty()) {
                        if (!request.getPatientId().equals(appt.getPatientId())) {
                            return false;
                        }
                    }
                    
                    // Date range filter
                    if (request.getStartDate() != null && !request.getStartDate().isEmpty()) {
                        LocalDate startDate = LocalDate.parse(request.getStartDate());
                        LocalDate apptDate = LocalDate.parse(appt.getAppointmentDate());
                        if (apptDate.isBefore(startDate)) {
                            return false;
                        }
                    }
                    
                    if (request.getEndDate() != null && !request.getEndDate().isEmpty()) {
                        LocalDate endDate = LocalDate.parse(request.getEndDate());
                        LocalDate apptDate = LocalDate.parse(appt.getAppointmentDate());
                        if (apptDate.isAfter(endDate)) {
                            return false;
                        }
                    }
                    
                    // Reason search
                    if (request.getReason() != null && !request.getReason().isEmpty()) {
                        if (appt.getReason() == null || !appt.getReason().toLowerCase()
                            .contains(request.getReason().toLowerCase())) {
                            return false;
                        }
                    }
                    
                    return true;
                })
                .map(this::convertAppointmentToResponse)
                .collect(Collectors.toList());
            
            // Apply sorting
            if (request.getSortBy() != null) {
                filtered = sortAppointments(filtered, request.getSortBy(), request.getSortOrder());
            } else {
                filtered.sort(Comparator.comparing(AppointmentFilterResponse::getAppointmentDate).reversed());
            }
            
            // Apply pagination
            Integer limit = request.getLimit() != null ? request.getLimit() : 20;
            Integer offset = request.getOffset() != null ? request.getOffset() : 0;
            
            List<AppointmentFilterResponse> paginated = filtered.stream()
                .skip(offset)
                .limit(limit)
                .collect(Collectors.toList());
            
            Integer totalCount = filtered.size();
            Integer pageNumber = (offset / limit) + 1;
            Integer totalPages = (int) Math.ceil((double) totalCount / limit);
            Boolean hasMore = (offset + limit) < totalCount;
            
            return SearchResultsWrapper.<AppointmentFilterResponse>builder()
                .data(paginated)
                .totalCount(totalCount)
                .limit(limit)
                .offset(offset)
                .pageNumber(pageNumber)
                .totalPages(totalPages)
                .hasMore(hasMore)
                .build();
        } catch (Exception e) {
            System.err.println("Error filtering appointments: " + e.getMessage());
            return SearchResultsWrapper.builder()
                .data(new ArrayList<>())
                .totalCount(0)
                .build();
        }
    }
    
    @Override
    public SearchResultsWrapper<?> filterAppointmentsByStatus(String status) {
        AppointmentFilterRequest request = AppointmentFilterRequest.builder()
            .status(status)
            .limit(20)
            .offset(0)
            .build();
        return filterAppointments(request);
    }
    
    @Override
    public SearchResultsWrapper<?> filterAppointmentsByDateRange(String startDate, String endDate) {
        AppointmentFilterRequest request = AppointmentFilterRequest.builder()
            .startDate(startDate)
            .endDate(endDate)
            .limit(20)
            .offset(0)
            .build();
        return filterAppointments(request);
    }
    
    @Override
    public SearchResultsWrapper<?> filterPrescriptions(PrescriptionFilterRequest request) {
        try {
            List<Prescription> allPrescriptions = prescriptionRepository.findAll();
            
            // Apply filters
            List<PrescriptionFilterResponse> filtered = allPrescriptions.stream()
                .filter(presc -> {
                    // Doctor ID filter
                    if (request.getDoctorId() != null && !request.getDoctorId().isEmpty()) {
                        if (!request.getDoctorId().equals(presc.getDoctorId())) {
                            return false;
                        }
                    }
                    
                    // Patient ID filter
                    if (request.getPatientId() != null && !request.getPatientId().isEmpty()) {
                        if (!request.getPatientId().equals(presc.getPatientId())) {
                            return false;
                        }
                    }
                    
                    // Medicine search
                    if (request.getMedicine() != null && !request.getMedicine().isEmpty()) {
                        if (presc.getMedicines() == null || !presc.getMedicines().toString().toLowerCase()
                            .contains(request.getMedicine().toLowerCase())) {
                            return false;
                        }
                    }
                    
                    // Date range filter
                    if (request.getStartDate() != null && !request.getStartDate().isEmpty()) {
                        LocalDate startDate = LocalDate.parse(request.getStartDate());
                        LocalDate prescDate = LocalDate.parse(presc.getCreatedAt().split("T")[0]);
                        if (prescDate.isBefore(startDate)) {
                            return false;
                        }
                    }
                    
                    if (request.getEndDate() != null && !request.getEndDate().isEmpty()) {
                        LocalDate endDate = LocalDate.parse(request.getEndDate());
                        LocalDate prescDate = LocalDate.parse(presc.getCreatedAt().split("T")[0]);
                        if (prescDate.isAfter(endDate)) {
                            return false;
                        }
                    }
                    
                    // Status filter (ACTIVE = within 30 days, COMPLETED = older)
                    if (request.getStatus() != null && !request.getStatus().isEmpty()) {
                        LocalDate prescDate = LocalDate.parse(presc.getCreatedAt().split("T")[0]);
                        LocalDate today = LocalDate.now();
                        long daysSince = java.time.temporal.ChronoUnit.DAYS.between(prescDate, today);
                        boolean isActive = daysSince <= 30;
                        
                        if ("ACTIVE".equalsIgnoreCase(request.getStatus()) && !isActive) {
                            return false;
                        }
                        if ("COMPLETED".equalsIgnoreCase(request.getStatus()) && isActive) {
                            return false;
                        }
                    }
                    
                    return true;
                })
                .map(this::convertPrescriptionToResponse)
                .collect(Collectors.toList());
            
            // Apply sorting
            if (request.getSortBy() != null) {
                filtered = sortPrescriptions(filtered, request.getSortBy(), request.getSortOrder());
            } else {
                filtered.sort(Comparator.comparing(PrescriptionFilterResponse::getCreatedDate).reversed());
            }
            
            // Apply pagination
            Integer limit = request.getLimit() != null ? request.getLimit() : 20;
            Integer offset = request.getOffset() != null ? request.getOffset() : 0;
            
            List<PrescriptionFilterResponse> paginated = filtered.stream()
                .skip(offset)
                .limit(limit)
                .collect(Collectors.toList());
            
            Integer totalCount = filtered.size();
            Integer pageNumber = (offset / limit) + 1;
            Integer totalPages = (int) Math.ceil((double) totalCount / limit);
            Boolean hasMore = (offset + limit) < totalCount;
            
            return SearchResultsWrapper.<PrescriptionFilterResponse>builder()
                .data(paginated)
                .totalCount(totalCount)
                .limit(limit)
                .offset(offset)
                .pageNumber(pageNumber)
                .totalPages(totalPages)
                .hasMore(hasMore)
                .build();
        } catch (Exception e) {
            System.err.println("Error filtering prescriptions: " + e.getMessage());
            return SearchResultsWrapper.builder()
                .data(new ArrayList<>())
                .totalCount(0)
                .build();
        }
    }
    
    @Override
    public SearchResultsWrapper<?> filterPrescriptionsByDoctor(String doctorId) {
        PrescriptionFilterRequest request = PrescriptionFilterRequest.builder()
            .doctorId(doctorId)
            .limit(20)
            .offset(0)
            .build();
        return filterPrescriptions(request);
    }
    
    @Override
    public SearchResultsWrapper<?> filterPrescriptionsByMedicine(String medicine) {
        PrescriptionFilterRequest request = PrescriptionFilterRequest.builder()
            .medicine(medicine)
            .limit(20)
            .offset(0)
            .build();
        return filterPrescriptions(request);
    }
    
    // Helper methods
    
    private SearchDoctorResponse convertUserToSearchDoctorResponse(User user) {
        Doctor doc = doctorRepository.findById(user.getId()).orElse(null);
        
        long appointmentsThisMonth = appointmentRepository.findByDoctorId(user.getId()).stream()
            .filter(appt -> {
                try {
                    LocalDate apptDate = LocalDate.parse(appt.getAppointmentDate());
                    LocalDate today = LocalDate.now();
                    return apptDate.getYear() == today.getYear() && 
                           apptDate.getMonthValue() == today.getMonthValue();
                } catch (Exception e) {
                    return false;
                }
            }).count();
        
        return SearchDoctorResponse.builder()
            .doctorId(user.getId())
            .name(user.getFullName())
            .email(user.getEmail())
            .specialization(user.getSpecialization())
            .phoneNumber(user.getPhoneNumber())
            .avgRating(doc != null ? doc.getRating() : 0.0)
            .totalRatings(doc != null ? doc.getTotalRatings() : 0)
            .totalAppointments(doc != null ? Math.toIntExact(appointmentRepository.findByDoctorId(user.getId()).stream().count()) : 0)
            .photoUrl(user.getPhotoUrl())
            .bio(user.getBio())
            .licenseNumber(user.getLicenseNumber())
            .appointmentsThisMonth(appointmentsThisMonth)
            .build();
    }

    private ProfileResponse convertUserToProfileResponse(User user) {
        return ProfileResponse.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .role(user.getRole().name())
            .phoneNumber(user.getPhoneNumber())
            .address(user.getAddress())
            .city(user.getCity())
            .state(user.getState())
            .zipCode(user.getZipCode())
            .photoUrl(user.getPhotoUrl())
            .bio(user.getBio())
            .specialization(user.getSpecialization())
            .licenseNumber(user.getLicenseNumber())
            .build();
    }
    
    private AppointmentFilterResponse convertAppointmentToResponse(Appointment appt) {
        User doctor = userRepository.findById(appt.getDoctorId()).orElse(null);
        User patient = userRepository.findById(appt.getPatientId()).orElse(null);
        
        return AppointmentFilterResponse.builder()
            .appointmentId(appt.getId())
            .doctorName(doctor != null ? doctor.getFullName() : "Unknown")
            .patientName(patient != null ? patient.getFullName() : "Unknown")
            .appointmentDate(appt.getAppointmentDate())
            .appointmentTime(appt.getAppointmentTime())
            .reason(appt.getReason())
            .status(appt.getStatus())
            .doctorId(appt.getDoctorId())
            .patientId(appt.getPatientId())
            .build();
    }
    
    private PrescriptionFilterResponse convertPrescriptionToResponse(Prescription presc) {
        User doctor = userRepository.findById(presc.getDoctorId()).orElse(null);
        User patient = userRepository.findById(presc.getPatientId()).orElse(null);
        
        LocalDate prescDate = LocalDate.parse(presc.getCreatedAt().split("T")[0]);
        LocalDate today = LocalDate.now();
        long daysSince = java.time.temporal.ChronoUnit.DAYS.between(prescDate, today);
        String status = daysSince <= 30 ? "ACTIVE" : "COMPLETED";
        
        return PrescriptionFilterResponse.builder()
            .prescriptionId(presc.getId())
            .doctorName(doctor != null ? doctor.getFullName() : "Unknown")
            .patientName(patient != null ? patient.getFullName() : "Unknown")
            .createdDate(presc.getCreatedAt())
            .status(status)
            .medicines(presc.getMedicines() != null ? presc.getMedicines().toString() : "")
            .dosageInstructions(presc.getDosageInstructions())
            .doctorId(presc.getDoctorId())
            .patientId(presc.getPatientId())
            .build();
    }
    
    private List<SearchDoctorResponse> sortDoctors(List<SearchDoctorResponse> doctors, String sortBy, String sortOrder) {
        Comparator<SearchDoctorResponse> comparator;
        
        switch (sortBy.toLowerCase()) {
            case "rating":
                comparator = Comparator.comparing(SearchDoctorResponse::getAvgRating);
                break;
            case "experience":
                comparator = Comparator.comparing(SearchDoctorResponse::getTotalAppointments);
                break;
            case "appointments":
                comparator = Comparator.comparing(SearchDoctorResponse::getAppointmentsThisMonth);
                break;
            case "name":
            default:
                comparator = Comparator.comparing(SearchDoctorResponse::getName);
        }
        
        if ("desc".equalsIgnoreCase(sortOrder)) {
            comparator = comparator.reversed();
        }
        
        doctors.sort(comparator);
        return doctors;
    }
    
    private List<AppointmentFilterResponse> sortAppointments(List<AppointmentFilterResponse> appointments, String sortBy, String sortOrder) {
        Comparator<AppointmentFilterResponse> comparator;
        
        switch (sortBy.toLowerCase()) {
            case "status":
                comparator = Comparator.comparing(AppointmentFilterResponse::getStatus);
                break;
            case "doctor":
                comparator = Comparator.comparing(AppointmentFilterResponse::getDoctorName);
                break;
            case "patient":
                comparator = Comparator.comparing(AppointmentFilterResponse::getPatientName);
                break;
            case "date":
            default:
                comparator = Comparator.comparing(AppointmentFilterResponse::getAppointmentDate);
        }
        
        if ("desc".equalsIgnoreCase(sortOrder)) {
            comparator = comparator.reversed();
        }
        
        appointments.sort(comparator);
        return appointments;
    }
    
    private List<PrescriptionFilterResponse> sortPrescriptions(List<PrescriptionFilterResponse> prescriptions, String sortBy, String sortOrder) {
        Comparator<PrescriptionFilterResponse> comparator;
        
        switch (sortBy.toLowerCase()) {
            case "doctor":
                comparator = Comparator.comparing(PrescriptionFilterResponse::getDoctorName);
                break;
            case "status":
                comparator = Comparator.comparing(PrescriptionFilterResponse::getStatus);
                break;
            case "date":
            default:
                comparator = Comparator.comparing(PrescriptionFilterResponse::getCreatedDate);
        }
        
        if ("desc".equalsIgnoreCase(sortOrder)) {
            comparator = comparator.reversed();
        }
        
        prescriptions.sort(comparator);
        return prescriptions;
    }
}
