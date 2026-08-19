"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import SilentLogin from "@/app/components/SilentLogin";
import { getFamilyMembers, addFamilyMember } from "@/services/patientDashboardService";
import { getUser, getAccessToken } from "@/utils/auth";
import { FaUserPlus, FaUsers, FaHeartbeat, FaChild, FaUserFriends } from "react-icons/fa";

export default function FamilyManagementPage() {
  const user = getUser();
  const token = getAccessToken();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newMember, setNewMember] = useState({
    fullName: "",
    relation: "SPOUSE",
    age: "",
    gender: "MALE",
    bloodGroup: "O+"
  });

  useEffect(() => {
    loadFamily();
  }, [user?.userId, token]);

  const loadFamily = async () => {
    if (!user?.userId || !token) return;
    try {
      const data = await getFamilyMembers(user.userId, token);
      setMembers(data);
    } catch (err) {
      setError("Failed to load family members.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await addFamilyMember(user.userId, newMember, token);
      loadFamily();
      setNewMember({ fullName: "", relation: "SPOUSE", age: "", gender: "MALE", bloodGroup: "O+" });
    } catch (err) {
      setError("Failed to add family member.");
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Family Management</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Add and manage health records for your family members.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Form */}
            <div className="xl:col-span-1">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FaUserPlus className="text-blue-500" />
                  Add Family Member
                </h2>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={newMember.fullName}
                      onChange={(e) => setNewMember({...newMember, fullName: e.target.value})}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Relation</label>
                      <select 
                        value={newMember.relation}
                        onChange={(e) => setNewMember({...newMember, relation: e.target.value})}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {["SPOUSE", "CHILD", "PARENT", "SIBLING", "OTHER"].map(rel => (
                          <option key={rel} value={rel}>{rel}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Age</label>
                      <input 
                        type="number" 
                        value={newMember.age}
                        onChange={(e) => setNewMember({...newMember, age: e.target.value})}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                      <select 
                        value={newMember.gender}
                        onChange={(e) => setNewMember({...newMember, gender: e.target.value})}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Blood Group</label>
                      <select 
                        value={newMember.bloodGroup}
                        onChange={(e) => setNewMember({...newMember, bloodGroup: e.target.value})}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 mt-4">
                    Add Member
                  </button>
                </form>
              </div>
            </div>

            {/* List */}
            <div className="xl:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <FaUsers className="text-2xl text-slate-400" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Registered Members</h2>
              </div>
              
              {members.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500">
                  No family members registered. Add one to manage their health records.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {members.map((member) => (
                    <div key={member.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-xl">
                          {member.relation === 'CHILD' ? <FaChild /> : <FaUserFriends />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-slate-100">{member.fullName}</h3>
                          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{member.relation}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-50 dark:border-slate-800 mb-4">
                        <div className="text-center border-r border-slate-50 dark:border-slate-800">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Age</p>
                          <p className="font-bold text-slate-700 dark:text-slate-200">{member.age}</p>
                        </div>
                        <div className="text-center border-r border-slate-50 dark:border-slate-800">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Gender</p>
                          <p className="font-bold text-slate-700 dark:text-slate-200">{member.gender.charAt(0)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Blood</p>
                          <p className="font-bold text-rose-500 flex items-center justify-center gap-1">
                            <FaHeartbeat className="text-[10px]" /> {member.bloodGroup}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                          History
                        </button>
                        <button className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all">
                          Book Appointment
                        </button>
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

