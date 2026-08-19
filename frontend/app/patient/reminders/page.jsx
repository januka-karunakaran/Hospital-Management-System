"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import SilentLogin from "@/app/components/SilentLogin";
import { getReminders, addReminder, toggleReminder, deleteReminder } from "@/services/reminderService";
import { getUser } from "@/utils/auth";
import { FaBell, FaPlus, FaTrash, FaCapsules, FaToggleOn, FaToggleOff } from "react-icons/fa";

export default function RemindersPage() {
  const user = getUser();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newReminder, setNewReminder] = useState({
    medicineName: "",
    times: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    notifyEmail: true,
    notifySMS: false
  });

  useEffect(() => {
    loadReminders();
  }, [user?.userId]);

  const loadReminders = async () => {
    if (!user?.userId) return;
    try {
      const data = await getReminders(user.userId);
      setReminders(data);
    } catch (err) {
      setError("Failed to load reminders.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    try {
      const timesArray = newReminder.times.split(",").map(t => t.trim());
      await addReminder({
        ...newReminder,
        patientId: user.userId,
        times: timesArray,
        isActive: true
      });
      loadReminders();
      setNewReminder({ medicineName: "", times: "", startDate: new Date().toISOString().split('T')[0], endDate: "", notifyEmail: true, notifySMS: false });
    } catch (err) {
      setError("Failed to add reminder.");
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleReminder(id);
      loadReminders();
    } catch (err) {
      setError("Failed to toggle reminder.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReminder(id);
      loadReminders();
    } catch (err) {
      setError("Failed to delete reminder.");
    }
  };

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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Medicine Reminders</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Never miss a dose. Set up your personalized reminders.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Form */}
            <div className="xl:col-span-1">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FaPlus className="text-blue-500 text-sm" />
                  New Reminder
                </h2>
                <form onSubmit={handleAddReminder} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Medicine Name</label>
                    <input 
                      type="text" 
                      value={newReminder.medicineName}
                      onChange={(e) => setNewReminder({...newReminder, medicineName: e.target.value})}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Times (e.g. 08:00, 20:00)</label>
                    <input 
                      type="text" 
                      value={newReminder.times}
                      onChange={(e) => setNewReminder({...newReminder, times: e.target.value})}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="08:00, 14:00"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                      <input 
                        type="date" 
                        value={newReminder.startDate}
                        onChange={(e) => setNewReminder({...newReminder, startDate: e.target.value})}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">End Date</label>
                      <input 
                        type="date" 
                        value={newReminder.endDate}
                        onChange={(e) => setNewReminder({...newReminder, endDate: e.target.value})}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 py-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newReminder.notifyEmail}
                        onChange={(e) => setNewReminder({...newReminder, notifyEmail: e.target.checked})}
                        className="w-4 h-4 rounded border-none bg-slate-100 dark:bg-slate-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Notification</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newReminder.notifySMS}
                        onChange={(e) => setNewReminder({...newReminder, notifySMS: e.target.checked})}
                        className="w-4 h-4 rounded border-none bg-slate-100 dark:bg-slate-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">SMS Notification</span>
                    </label>
                  </div>
                  <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                    Set Reminder
                  </button>
                </form>
              </div>
            </div>

            {/* List */}
            <div className="xl:col-span-2 space-y-4">
              <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Active Reminders</h2>
              {reminders.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500">
                  No medicine reminders set yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reminders.map((rem) => (
                    <div key={rem.id} className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all group ${!rem.isActive && 'opacity-60 grayscale'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center text-xl">
                            <FaCapsules />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{rem.medicineName}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ongoing</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handleToggle(rem.id)} className="p-2 text-xl text-slate-400 hover:text-blue-500 transition-colors">
                              {rem.isActive ? <FaToggleOn className="text-blue-500" /> : <FaToggleOff />}
                           </button>
                           <button onClick={() => handleDelete(rem.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                              <FaTrash />
                           </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {rem.times?.map(time => (
                          <span key={time} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl flex items-center gap-2">
                            <FaBell className="text-[10px] text-blue-500" /> {time}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase pt-4 border-t border-slate-50 dark:border-slate-800">
                        <span>From: {rem.startDate}</span>
                        <span>{rem.notifyEmail ? 'Email On' : 'Email Off'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

