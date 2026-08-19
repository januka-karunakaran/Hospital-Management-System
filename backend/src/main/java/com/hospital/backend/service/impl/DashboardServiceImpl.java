package com.hospital.backend.service.impl;

import com.hospital.backend.dto.*;
import com.hospital.backend.enums.Role;
import com.hospital.backend.model.Appointment;
import com.hospital.backend.model.Doctor;
import com.hospital.backend.model.User;
import com.hospital.backend.repository.AppointmentRepository;
import com.hospital.backend.repository.DoctorRepository;
import com.hospital.backend.repository.UserRepository;
import com.hospital.backend.repository.NotificationRepository;
import com.hospital.backend.repository.PrescriptionRepository;
import com.hospital.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationRepository notificationRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Override
    public DashboardSummaryDTO getDashboardSummary(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        
        return DashboardSummaryDTO.builder()
                .userStats(getUserStats())
                .appointmentStats(getAppointmentStats())
                .revenueStats(getRevenueStats())
                .dailyMetrics(getDailyMetrics(7))
                .topDoctors(getTopDoctors(5))
                .pendingAppointmentsCount(countPendingAppointments())
                .totalNotifications(notificationRepository.count())
                .build();
    }

    @Override
    public UserStatsDTO getUserStats() {
        long totalUsers = userRepository.count();
        long totalDoctors = userRepository.countByRole(Role.DOCTOR);
        long totalPatients = userRepository.countByRole(Role.PATIENT);
        long totalAdmins = userRepository.countByRole(Role.ADMIN);

        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime today = LocalDateTime.now();

        // Count new patients this month
        List<User> newPatientsThisMonth = userRepository.findByRole(Role.PATIENT)
                .stream()
                .filter(p -> p.getId() != null) // Filter if created_at is available
                .collect(Collectors.toList());

        long activePatientsThisMonth = newPatientsThisMonth.size();

        // Count active appointments today (using appointmentDate + appointmentTime fields)
        long activeAppointmentsToday = appointmentRepository.findAll()
                .stream()
                .filter(a -> a.getAppointmentDate() != null && a.getAppointmentDate().equals(LocalDate.now().toString()))
                .count();

        return UserStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalDoctors(totalDoctors)
                .totalPatients(totalPatients)
                .totalAdmins(totalAdmins)
                .newPatientsThisMonth(newPatientsThisMonth.size())
                .activePatientsThisMonth(activePatientsThisMonth)
                .activeAppointmentsToday(activeAppointmentsToday)
                .build();
    }

    @Override
    public AppointmentStatsDTO getAppointmentStats() {
        List<Appointment> allAppointments = appointmentRepository.findAll();

        long total = allAppointments.size();
        long completed = allAppointments.stream()
                .filter(a -> a.getStatus() != null && a.getStatus().equals("COMPLETED"))
                .count();
        long cancelled = allAppointments.stream()
                .filter(a -> a.getStatus() != null && a.getStatus().equals("CANCELLED"))
                .count();
        long pending = allAppointments.stream()
                .filter(a -> a.getStatus() == null || 
                        (!a.getStatus().equals("COMPLETED") && !a.getStatus().equals("CANCELLED")))
                .count();

        double completionRate = total > 0 ? (double) completed / total * 100 : 0;

        return AppointmentStatsDTO.builder()
                .totalAppointments(total)
                .completedAppointments(completed)
                .cancelledAppointments(cancelled)
                .pendingAppointments(pending)
                .completionRate(completionRate)
                .build();
    }

    @Override
    public RevenueStatsDTO getRevenueStats() {
        // Sample revenue calculation - adjust based on your billing model
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(7);
        LocalDate monthStart = today.withDayOfMonth(1);

        long appointmentsToday = getAppointmentsCount(today, today);
        long appointmentsThisWeek = getAppointmentsCount(weekStart, today);
        long appointmentsThisMonth = getAppointmentsCount(monthStart, today);

        double consultationFee = 500.0; // Default fee
        double dailyRevenue = appointmentsToday * consultationFee;
        double weeklyRevenue = appointmentsThisWeek * consultationFee;
        double monthlyRevenue = appointmentsThisMonth * consultationFee;
        double totalRevenue = (double) appointmentRepository.count() * consultationFee;

        return RevenueStatsDTO.builder()
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthlyRevenue)
                .weeklyRevenue(weeklyRevenue)
                .dailyRevenue(dailyRevenue)
                .avgConsultationFee(consultationFee)
                .totalTransactions(appointmentRepository.count())
                .build();
    }

    @Override
    public List<DailyMetricsDTO> getDailyMetrics(int days) {
        List<DailyMetricsDTO> metrics = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            long appointmentCount = appointmentRepository.findAll()
                    .stream()
                    .filter(a -> a.getAppointmentDate() != null && a.getAppointmentDate().equals(date.toString()))
                    .count();

            double revenue = appointmentCount * 500.0; // Assuming 500 per appointment

            DailyMetricsDTO metric = DailyMetricsDTO.builder()
                    .date(date)
                    .appointmentCount(appointmentCount)
                    .revenue(revenue)
                    .newPatients(0) // Could calculate from creation dates
                    .newPrescriptions(0)
                    .build();

            metrics.add(metric);
        }

        return metrics;
    }

    @Override
    public List<DoctorPerformanceDTO> getTopDoctors(int limit) {
        List<Doctor> allDoctors = doctorRepository.findAll();

        return allDoctors.stream()
                .map(doctor -> {
                    List<Appointment> doctorAppointments = appointmentRepository.findAll()
                            .stream()
                            .filter(a -> a.getDoctorId() != null && a.getDoctorId().equals(doctor.getId()))
                            .collect(Collectors.toList());

                    long completed = doctorAppointments.stream()
                            .filter(a -> a.getStatus() != null && a.getStatus().equals("COMPLETED"))
                            .count();

                    double appointmentRate = doctorAppointments.size() > 0 
                            ? (double) completed / doctorAppointments.size() * 100 
                            : 0;

                    return DoctorPerformanceDTO.builder()
                            .doctorId(doctor.getId())
                            .doctorName(doctor.getFullName())
                            .specialization(doctor.getSpecialization())
                            .totalAppointments(doctorAppointments.size())
                            .completedAppointments(completed)
                            .avgRating(doctor.getRating() != null ? doctor.getRating() : 0)
                            .appointmentRate(appointmentRate)
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getTotalAppointments(), a.getTotalAppointments()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentStatsDTO getDoctorAppointmentStats(String doctorId) {
        List<Appointment> doctorAppointments = appointmentRepository.findAll()
                .stream()
                .filter(a -> a.getDoctorId() != null && a.getDoctorId().equals(doctorId))
                .collect(Collectors.toList());

        long total = doctorAppointments.size();
        long completed = doctorAppointments.stream()
                .filter(a -> a.getStatus() != null && a.getStatus().equals("COMPLETED"))
                .count();
        long cancelled = doctorAppointments.stream()
                .filter(a -> a.getStatus() != null && a.getStatus().equals("CANCELLED"))
                .count();
        long pending = total - completed - cancelled;

        double completionRate = total > 0 ? (double) completed / total * 100 : 0;

        return AppointmentStatsDTO.builder()
                .totalAppointments(total)
                .completedAppointments(completed)
                .cancelledAppointments(cancelled)
                .pendingAppointments(pending)
                .completionRate(completionRate)
                .build();
    }

    @Override
    public DoctorPerformanceDTO getDoctorPerformance(String doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
        if (doctor == null) {
            return null;
        }

        List<Appointment> doctorAppointments = appointmentRepository.findAll()
                .stream()
                .filter(a -> a.getDoctorId() != null && a.getDoctorId().equals(doctorId))
                .collect(Collectors.toList());

        long completed = doctorAppointments.stream()
                .filter(a -> a.getStatus() != null && a.getStatus().equals("COMPLETED"))
                .count();

        double appointmentRate = doctorAppointments.size() > 0 
                ? (double) completed / doctorAppointments.size() * 100 
                : 0;

        return DoctorPerformanceDTO.builder()
                .doctorId(doctor.getId())
                .doctorName(doctor.getFullName())
                .specialization(doctor.getSpecialization())
                .totalAppointments(doctorAppointments.size())
                .completedAppointments(completed)
                .avgRating(doctor.getRating() != null ? doctor.getRating() : 0)
                .appointmentRate(appointmentRate)
                .build();
    }

    @Override
    public List<DailyMetricsDTO> getAppointmentTrends(int days) {
        return getDailyMetrics(days);
    }

    @Override
    public List<DailyMetricsDTO> getRevenueTrends(int days) {
        return getDailyMetrics(days);
    }

    @Override
    public long getAppointmentsCount(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

                return appointmentRepository.findAll()
                                .stream()
                                .filter(a -> {
                                        if (a.getAppointmentDate() == null) return false;
                                        try {
                                                LocalDate d = LocalDate.parse(a.getAppointmentDate());
                                                return !(d.isBefore(startDate) || d.isAfter(endDate));
                                        } catch (Exception ex) {
                                                return false;
                                        }
                                })
                                .count();
    }

    @Override
    public double getCompletionRate() {
        return getAppointmentStats().getCompletionRate();
    }

    @Override
    public Map<String, Long> getDiseaseTrends() {
        return prescriptionRepository.findAll().stream()
                .filter(p -> p.getDiagnosis() != null && !p.getDiagnosis().isEmpty())
                .collect(Collectors.groupingBy(
                        p -> p.getDiagnosis(),
                        Collectors.counting()
                ));
    }

    private long countPendingAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .filter(a -> a.getStatus() == null || 
                        (!a.getStatus().equals("COMPLETED") && !a.getStatus().equals("CANCELLED")))
                .count();
    }
}
