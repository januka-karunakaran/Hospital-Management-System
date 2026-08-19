"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import {
  getPatientById,
  updatePatient,
} from "@/services/adminService";

export default function EditPatientPage() {
  const { id } = useParams();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    bloodGroup: "",
    address: "",
  });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const data = await getPatientById(id);
        setForm({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          age: data.age || "",
          gender: data.gender || "",
          bloodGroup: data.bloodGroup || "",
          address: data.address || "",
        });
      } catch (e) {
        setErr(e.message);
      }
    };

    if (id) loadPatient();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setErr("");
      setMsg("");

      await updatePatient(id, {
        ...form,
        age: Number(form.age),
      });

      setMsg("Patient updated successfully");
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="p-6 flex-1">
          <Topbar />

          <div className="bg-white p-6 mt-6 rounded-2xl max-w-xl border shadow-sm">
            <h2 className="text-xl font-bold mb-4">Edit Patient</h2>

            {msg && <p className="text-green-600 mb-3">{msg}</p>}
            {err && <p className="text-red-600 mb-3">{err}</p>}

            <input
              name="fullName"
              placeholder="Name"
              value={form.fullName}
              onChange={handleChange}
              className="input"
            />
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="input"
            />
            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              className="input"
            />
            <input
              name="age"
              placeholder="Age"
              value={form.age}
              onChange={handleChange}
              className="input"
            />
            <input
              name="gender"
              placeholder="Gender"
              value={form.gender}
              onChange={handleChange}
              className="input"
            />
            <input
              name="bloodGroup"
              placeholder="Blood Group"
              value={form.bloodGroup}
              onChange={handleChange}
              className="input"
            />
            <input
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              className="input"
            />

            <button onClick={handleSubmit} className="btn">
              Update Patient
            </button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
