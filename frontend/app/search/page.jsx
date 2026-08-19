"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import SilentLogin from "@/app/components/SilentLogin";
import { apiFetch } from "@/services/api";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState({ doctors: [], appointments: [], prescriptions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        // Parallel fetching for different categories
        const [doctorRes, appointmentRes, prescriptionRes] = await Promise.all([
          apiFetch(`/search/doctors/name/${encodeURIComponent(query)}`),
          apiFetch(`/search/appointments`, {
            method: "POST",
            body: JSON.stringify({ reason: query })
          }),
          apiFetch(`/search/prescriptions`, {
            method: "POST",
            body: JSON.stringify({ medicine: query })
          })
        ]);

        setResults({
          doctors: doctorRes.data || [],
          appointments: appointmentRes.data || [],
          prescriptions: prescriptionRes.data || []
        });
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const hasResults = results.doctors.length > 0 || results.appointments.length > 0 || results.prescriptions.length > 0;

  return (
    <div className="mt-8 space-y-8">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
        Results for "{query}"
      </h2>

      {!hasResults ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400">No results found for your search.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Doctors */}
          {results.doctors.length > 0 && (
            <section>
              <h3 className="text-lg font-bold mb-4 text-slate-700 dark:text-slate-200">Doctors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.doctors.map((doc) => (
                  <div key={doc.doctorId} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <img 
                      src={doc.photoUrl || `https://ui-avatars.com/api/?name=${doc.name}`} 
                      className="h-12 w-12 rounded-xl object-cover" 
                      alt={doc.name} 
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{doc.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{doc.specialization}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Appointments */}
          {results.appointments.length > 0 && (
            <section>
              <h3 className="text-lg font-bold mb-4 text-slate-700 dark:text-slate-200">Appointments</h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Patient/Doctor</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {results.appointments.map((appt) => (
                      <tr key={appt.appointmentId}>
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{appt.patientName}</p>
                          <p className="text-[10px] text-slate-500">with {appt.doctorName}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{appt.appointmentDate}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            appt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <SilentLogin />
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <main className="flex-1 p-6">
          <Topbar />
          <Suspense fallback={<div>Loading...</div>}>
            <SearchResults />
          </Suspense>
        </main>
      </div>
    </ProtectedRoute>
  );
}

