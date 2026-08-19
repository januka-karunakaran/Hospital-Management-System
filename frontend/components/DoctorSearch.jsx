"use client";

import { useState } from "react";
import { FaSearch, FaStar, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import {
  searchDoctors,
  searchDoctorsBySpecialization,
  searchDoctorsByName,
} from "@/services/searchService";
import { getToken } from "@/utils/auth";

/**
 * DoctorSearch Component - Search and filter doctors
 */
export default function DoctorSearch() {
  const token = typeof window !== "undefined" ? getToken() : "";

  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("name");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const specializations = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Dermatology",
    "Ophthalmology",
    "ENT",
    "General Practice",
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const criteria = {
        searchTerm: searchTerm || null,
        specialization: specialization || null,
        minRating: minRating > 0 ? minRating : null,
        sortBy: sortBy,
        sortOrder: "asc",
        limit: 20,
        offset: 0,
      };

      const data = await searchDoctors(criteria, token);
      setResults(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to search doctors");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpecialtyClick = async (spec) => {
    setIsLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const data = await searchDoctorsBySpecialization(spec, token);
      setResults(data.data || []);
      setSpecialization(spec);
    } catch (err) {
      setError(err.message || "Failed to search doctors");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"}
            size={14}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find a Doctor</h1>
          <p className="text-gray-600">Search and filter doctors by specialization, rating, and more</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Name or Specialty
              </label>
              <input
                type="text"
                placeholder="Dr. Smith, Cardiology..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialization
              </label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Specialties</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Any Rating</option>
                <option value={3}>3+ Stars</option>
                <option value={3.5}>3.5+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="rating">Rating</option>
                <option value="experience">Experience</option>
                <option value="appointments">Appointments</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <FaSearch /> {isLoading ? "Searching..." : "Search Doctors"}
          </button>
        </form>

        {/* Popular Specialties */}
        {!hasSearched && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Specialties</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {specializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => handleSpecialtyClick(spec)}
                  className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition text-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Searching doctors...</p>
          </div>
        )}

        {/* Results */}
        {hasSearched && !isLoading && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {results.length} doctors found
            </h2>

            {results.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">No doctors found matching your criteria. Try adjusting your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((doctor) => (
                  <div
                    key={doctor.doctorId}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border border-gray-100"
                  >
                    {/* Doctor Header */}
                    <div className="p-6 border-b border-gray-100">
                      {doctor.photoUrl && (
                        <img
                          src={doctor.photoUrl}
                          alt={doctor.name}
                          className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                        />
                      )}
                      <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
                        {doctor.name}
                      </h3>
                      <p className="text-sm text-blue-600 text-center font-medium">
                        {doctor.specialization}
                      </p>
                    </div>

                    {/* Doctor Info */}
                    <div className="p-6 space-y-4">
                      {/* Rating */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Rating</span>
                        <div className="flex items-center gap-2">
                          {renderStars(doctor.avgRating)}
                          <span className="text-sm font-semibold text-gray-900">
                            {doctor.avgRating ? doctor.avgRating.toFixed(1) : "N/A"}
                          </span>
                          {doctor.totalRatings > 0 && (
                            <span className="text-xs text-gray-500">({doctor.totalRatings})</span>
                          )}
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total Appointments</span>
                        <span className="font-semibold text-gray-900">{doctor.totalAppointments}</span>
                      </div>

                      {/* This Month */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">This Month</span>
                        <span className="font-semibold text-gray-900">{doctor.appointmentsThisMonth}</span>
                      </div>

                      {/* Contact */}
                      {doctor.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaPhone size={14} />
                          <span>{doctor.phoneNumber}</span>
                        </div>
                      )}

                      {doctor.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaEnvelope size={14} />
                          <span className="truncate">{doctor.email}</span>
                        </div>
                      )}

                      {/* Bio */}
                      {doctor.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2 italic">
                          &quot;{doctor.bio}&quot;
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
                        Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
