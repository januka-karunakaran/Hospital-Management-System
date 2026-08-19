"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import SilentLogin from "@/app/components/SilentLogin";
import { getMedicalHistory } from "@/services/patientDashboardService";
import { getUser, getAccessToken } from "@/utils/auth";
import { FaFileMedical, FaCalendarCheck, FaStethoscope, FaClock } from "react-icons/fa";

export default function MedicalHistoryPage() {
  const user = getUser();
  const token = getAccessToken();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.userId || !token) return;
      try {
        const data = await getMedicalHistory(user.userId, token);
        setHistory(data);
      } catch (err) {
        setError(err.message || "Failed to load medical history");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user?.userId, token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["PATIENT"]}>
      <SilentLogin />
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <Sidebar />
        <main className="flex-1 p-6">
          <Topbar />

          <div className="mt-8 mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Medical History</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">A complete timeline of your health records.</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {history.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                <FaFileMedical className="mx-auto text-5xl text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">No medical records found in your history.</p>
              </div>
            ) : (
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
                {history.map((record, idx) => (
                  <div key={record.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
                    {/* Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white z-10">
                      {record.type === 'APPOINTMENT' ? <FaCalendarCheck /> : <FaFileMedical />}
                    </div>
                    {/* Content Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:border-blue-500/50">
                      <div className="flex items-center justify-between mb-2">
                        <time className="font-bold text-blue-600 text-sm uppercase tracking-wider">{record.date}</time>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          record.type === 'APPOINTMENT' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {record.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{record.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                        <FaStethoscope />
                        <span>{record.doctorName}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm italic">"{record.description}"</p>
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                         <span className="text-xs font-bold text-slate-400">Status: {record.status}</span>
                         <button className="text-xs font-bold text-blue-600 hover:underline">View Report</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

