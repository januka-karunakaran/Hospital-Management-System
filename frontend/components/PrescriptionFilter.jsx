"use client";

import { useState } from "react";
import { FaFilter, FaPills } from "react-icons/fa";
import { filterPrescriptions, filterPrescriptionsByMedicine } from "@/services/searchService";
import { getToken } from "@/utils/auth";

/**
 * PrescriptionFilter Component - Filter prescriptions by status, medicine, doctor, etc.
 */
export default function PrescriptionFilter() {
  const token = typeof window !== "undefined" ? getToken() : "";

  const [status, setStatus] = useState("");
  const [medicine, setMedicine] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleFilter = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const criteria = {
        status: status || null,
        medicine: medicine || null,
        startDate: startDate || null,
        endDate: endDate || null,
        sortBy: sortBy,
        sortOrder: "desc",
        limit: 50,
        offset: 0,
      };

      const data = await filterPrescriptions(criteria, token);
      setResults(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to filter prescriptions");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-purple-100 text-purple-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "EXPIRED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Prescriptions</h1>
          <p className="text-gray-600">Filter and view your prescriptions</p>
        </div>

        {/* Filter Form */}
        <form onSubmit={handleFilter} className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Medicine Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicine Name
              </label>
              <input
                type="text"
                placeholder="Search medicine..."
                value={medicine}
                onChange={(e) => setMedicine(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <FaFilter /> {isLoading ? "Filtering..." : "Apply Filter"}
          </button>
        </form>

        {/* Quick Filter Buttons */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={async () => {
              setIsLoading(true);
              setHasSearched(true);
              try {
                const criteria = { status: "ACTIVE", limit: 50, offset: 0 };
                const data = await filterPrescriptions(criteria, token);
                setResults(data.data || []);
                setStatus("ACTIVE");
              } catch (err) {
                setError(err.message);
              } finally {
                setIsLoading(false);
              }
            }}
            className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:shadow-md transition text-purple-700 font-medium"
          >
            💊 Active Prescriptions
          </button>

          <button
            onClick={async () => {
              setIsLoading(true);
              setHasSearched(true);
              try {
                const criteria = { status: "COMPLETED", limit: 50, offset: 0 };
                const data = await filterPrescriptions(criteria, token);
                setResults(data.data || []);
                setStatus("COMPLETED");
              } catch (err) {
                setError(err.message);
              } finally {
                setIsLoading(false);
              }
            }}
            className="p-4 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition text-green-700 font-medium"
          >
            ✓ Completed Prescriptions
          </button>

          <button
            onClick={async () => {
              setIsLoading(true);
              setHasSearched(true);
              try {
                const criteria = { status: "EXPIRED", limit: 50, offset: 0 };
                const data = await filterPrescriptions(criteria, token);
                setResults(data.data || []);
                setStatus("EXPIRED");
              } catch (err) {
                setError(err.message);
              } finally {
                setIsLoading(false);
              }
            }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg hover:shadow-md transition text-red-700 font-medium"
          >
            ✗ Expired Prescriptions
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Filtering prescriptions...</p>
          </div>
        )}

        {/* Results */}
        {hasSearched && !isLoading && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {results.length} prescription{results.length !== 1 ? "s" : ""} found
            </h2>

            {results.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                <FaPills className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-600">No prescriptions found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((prescription) => (
                  <div
                    key={prescription.prescriptionId}
                    className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {prescription.doctorName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Prescribed to: {prescription.patientName}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(
                          prescription.status
                        )}`}
                      >
                        {prescription.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Medicines</p>
                      <p className="text-gray-900 font-medium">{prescription.medicines}</p>
                    </div>

                    {prescription.dosageInstructions && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Dosage Instructions</p>
                        <p className="text-gray-700">{prescription.dosageInstructions}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm text-gray-600 pt-4 border-t border-gray-100">
                      <span>
                        Issued: {new Date(prescription.createdDate).toLocaleDateString()}
                      </span>
                      <span className="font-mono text-xs text-gray-500">
                        ID: {prescription.prescriptionId.slice(0, 8)}...
                      </span>
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
