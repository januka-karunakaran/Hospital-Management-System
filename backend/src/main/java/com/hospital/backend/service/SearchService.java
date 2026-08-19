package com.hospital.backend.service;

import com.hospital.backend.dto.*;

/**
 * Service for searching and filtering doctors, appointments, and prescriptions
 */
public interface SearchService {
    
    // Doctor Search Methods
    SearchResultsWrapper<SearchDoctorResponse> searchDoctors(SearchDoctorRequest request);
    SearchResultsWrapper<SearchDoctorResponse> searchDoctorsBySpecialization(String specialization);
    SearchResultsWrapper<SearchDoctorResponse> searchDoctorsByName(String name);
    
    // Patient Search Methods
    SearchResultsWrapper<ProfileResponse> searchPatients(String searchTerm);
    
    // Appointment Filter Methods
    SearchResultsWrapper<?> filterAppointments(AppointmentFilterRequest request);
    SearchResultsWrapper<?> filterAppointmentsByStatus(String status);
    SearchResultsWrapper<?> filterAppointmentsByDateRange(String startDate, String endDate);
    
    // Prescription Filter Methods
    SearchResultsWrapper<?> filterPrescriptions(PrescriptionFilterRequest request);
    SearchResultsWrapper<?> filterPrescriptionsByDoctor(String doctorId);
    SearchResultsWrapper<?> filterPrescriptionsByMedicine(String medicine);
}
