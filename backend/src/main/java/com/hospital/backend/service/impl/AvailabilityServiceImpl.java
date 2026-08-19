package com.hospital.backend.service.impl;

import com.hospital.backend.dto.DoctorAvailabilityDTO;
import com.hospital.backend.dto.AvailableSlotsResponse;
import com.hospital.backend.model.Appointment;
import com.hospital.backend.model.Availability;
import com.hospital.backend.model.Doctor;
import com.hospital.backend.repository.AppointmentRepository;
import com.hospital.backend.repository.AvailabilityRepository;
import com.hospital.backend.repository.DoctorRepository;
import com.hospital.backend.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public DoctorAvailabilityDTO setAvailability(DoctorAvailabilityDTO dto) {
        Availability availability;
        
        if (dto.getDate() != null && !dto.getDate().isEmpty()) {
            availability = availabilityRepository.findByDoctorIdAndDate(dto.getDoctorId(), dto.getDate())
                    .orElse(new Availability());
        } else {
            availability = new Availability();
        }

        availability.setDoctorId(dto.getDoctorId());
        availability.setDayOfWeek(dto.getDayOfWeek());
        availability.setDate(dto.getDate());
        availability.setTimeSlots(dto.getTimeSlots());
        availability.setAvailable(dto.isAvailable());
        availability.setReason(dto.getReason());

        Availability saved = availabilityRepository.save(availability);
        return convertToDTO(saved);
    }

    @Override
    public List<DoctorAvailabilityDTO> getDoctorAvailability(String doctorId) {
        return getDoctorIdentifiers(doctorId).stream()
                .flatMap(id -> availabilityRepository.findByDoctorId(id).stream())
                .distinct()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AvailableSlotsResponse getAvailableSlots(String doctorId, String date) {
        LocalDate selectedDate = LocalDate.parse(date);
        List<String> doctorIdentifiers = getDoctorIdentifiers(doctorId);

        Availability datedSchedule = doctorIdentifiers.stream()
                .map(id -> availabilityRepository.findByDoctorIdAndDate(id, date).orElse(null))
                .filter(item -> item != null)
                .findFirst()
                .orElse(null);

        List<Availability> matchingSchedules;
        if (datedSchedule != null) {
            matchingSchedules = List.of(datedSchedule);
        } else {
            String dayOfWeek = selectedDate.getDayOfWeek().name();
            matchingSchedules = doctorIdentifiers.stream()
                    .flatMap(id -> availabilityRepository.findByDoctorIdAndDayOfWeek(id, dayOfWeek).stream())
                    .collect(Collectors.toList());
        }

        boolean scheduleConfigured = !matchingSchedules.isEmpty();
        boolean available = scheduleConfigured && matchingSchedules.stream().anyMatch(Availability::isAvailable);
        String reason = matchingSchedules.stream()
                .filter(item -> !item.isAvailable() && item.getReason() != null)
                .map(Availability::getReason)
                .findFirst()
                .orElse(null);

        Set<String> configuredSlots = matchingSchedules.stream()
                .filter(Availability::isAvailable)
                .filter(item -> item.getTimeSlots() != null)
                .flatMap(item -> item.getTimeSlots().stream())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        List<Appointment> dailyAppointments = appointmentRepository
                .findByDoctorIdAndAppointmentDate(doctorId, date).stream()
                .filter(item -> !isInactive(item.getStatus()))
                .collect(Collectors.toList());
        Set<String> bookedSlots = dailyAppointments.stream()
                .map(Appointment::getAppointmentTime)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        List<String> openSlots = configuredSlots.stream()
                .filter(slot -> !bookedSlots.contains(slot))
                .collect(Collectors.toCollection(ArrayList::new));

        return AvailableSlotsResponse.builder()
                .doctorId(doctorId)
                .date(date)
                .scheduleConfigured(scheduleConfigured)
                .available(available)
                .availableSlots(openSlots)
                .bookedSlots(new ArrayList<>(bookedSlots))
                .bookedPatientCount(dailyAppointments.size())
                .reason(reason)
                .build();
    }

    @Override
    public void deleteAvailability(String id) {
        availabilityRepository.deleteById(id);
    }

    private List<String> getDoctorIdentifiers(String doctorId) {
        Set<String> identifiers = new LinkedHashSet<>();
        identifiers.add(doctorId);

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseGet(() -> doctorRepository.findByUserId(doctorId).orElse(null));
        if (doctor != null) {
            identifiers.add(doctor.getId());
            if (doctor.getUserId() != null && !doctor.getUserId().isBlank()) {
                identifiers.add(doctor.getUserId());
            }
        }
        return new ArrayList<>(identifiers);
    }

    private boolean isInactive(String status) {
        return "CANCELLED".equalsIgnoreCase(status) || "REJECTED".equalsIgnoreCase(status);
    }

    private DoctorAvailabilityDTO convertToDTO(Availability availability) {
        return DoctorAvailabilityDTO.builder()
                .id(availability.getId())
                .doctorId(availability.getDoctorId())
                .dayOfWeek(availability.getDayOfWeek())
                .date(availability.getDate())
                .timeSlots(availability.getTimeSlots())
                .isAvailable(availability.isAvailable())
                .reason(availability.getReason())
                .build();
    }
}
