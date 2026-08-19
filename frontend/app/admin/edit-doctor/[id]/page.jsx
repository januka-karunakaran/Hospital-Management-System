"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { getDoctorById, updateDoctor } from "@/services/adminService";

export default function EditDoctorPage() {
  const { id } = useParams();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    experienceYears: "",
    status: "ACTIVE",
  });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const data = await getDoctorById(id);
        setForm({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          specialization: data.specialization || "",
          experienceYears: data.experienceYears || "",
          status: data.status || "ACTIVE",
        });
      } catch (e) {
        setErr(e.message);
      }
    };

    if (id) loadDoctor();
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

      await updateDoctor(id, {
        ...form,
        experienceYears: Number(form.experienceYears),
      });

      setMsg("Doctor updated successfully");
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
            <h2 className="text-xl font-bold mb-4">Edit Doctor</h2>

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
              name="specialization"
              placeholder="Specialization"
              value={form.specialization}
              onChange={handleChange}
              className="input"
            />
            <input
              name="experienceYears"
              placeholder="Experience"
              value={form.experienceYears}
              onChange={handleChange}
              className="input"
            />

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="input"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>

            <button onClick={handleSubmit} className="btn">
              Update Doctor
            </button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
