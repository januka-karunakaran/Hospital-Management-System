"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaCheck, FaExclamationTriangle, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { API_BASE } from "@/utils/constants";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must contain at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { setError("This reset link is invalid or incomplete."); return; }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to reset your password.");
      }
      setComplete(true);
    } catch (requestError) { setError(requestError.message || "Unable to connect to the server."); }
    finally { setLoading(false); }
  };

  return <main className="page"><section className="card">
    <div className="brand"><Image src="/medicore-logo.png" alt="MediCore logo" width={48} height={48} priority /><span>MediCore HMS</span></div>
    {complete ? <>
      <div className="icon success"><FaCheck /></div><h1>Password updated</h1>
      <p>Your password has been reset successfully. You can now sign in with your new password.</p>
      <Link className="primary" href="/login">Continue to Sign In</Link>
    </> : <>
      <div className="icon"><FaLock /></div><h1>Create new password</h1>
      <p>Choose a strong password with at least 8 characters.</p>
      {error && <div className="error"><FaExclamationTriangle /><span>{error}</span></div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="password">New password</label>
        <div className="field"><input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required minLength={8} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button></div>
        <label htmlFor="confirm-password">Confirm new password</label>
        <div className="field"><input id="confirm-password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required minLength={8} /></div>
        <button className="primary" type="submit" disabled={loading}>{loading ? "Updating..." : "Reset Password"}</button>
      </form>
      <Link className="back" href="/login">Back to Sign In</Link>
    </>}
  </section><style jsx>{`
    .page{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 0%,rgba(37,99,235,.15),transparent 38%),#080d19;color:#fff;font-family:Inter,Arial,sans-serif}.card{width:100%;max-width:480px;padding:44px 42px;border:1px solid rgba(148,163,184,.16);border-radius:24px;background:rgba(15,23,42,.86);box-shadow:0 24px 80px rgba(0,0,0,.28)}.brand{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:36px;font-size:21px;font-weight:750}.icon{width:72px;height:72px;display:grid;place-items:center;margin:0 auto 24px;border:1px solid rgba(59,130,246,.35);border-radius:20px;background:rgba(59,130,246,.12);color:#60a5fa;font-size:28px}.icon.success{border-radius:50%;border-color:rgba(34,197,94,.35);background:rgba(34,197,94,.12);color:#4ade80}h1{text-align:center;margin:0 0 10px;font-size:28px}p{text-align:center;margin:0 auto 28px;color:#94a3b8;font-size:14px;line-height:1.65}label{display:block;margin:0 0 8px;color:#a7b0c0;font-size:13px;font-weight:600}.field{display:flex;align-items:center;margin-bottom:18px;border:1px solid rgba(148,163,184,.22);border-radius:12px;background:rgba(255,255,255,.05)}.field:focus-within{border-color:#3b82f6;box-shadow:0 0 0 4px rgba(59,130,246,.12)}input{width:100%;padding:15px;border:0;outline:0;background:transparent;color:#fff;font:inherit}.field button{padding:15px;border:0;background:none;color:#94a3b8;cursor:pointer}.primary{width:100%;min-height:50px;display:flex;align-items:center;justify-content:center;border:0;border-radius:12px;background:linear-gradient(135deg,#2563eb,#0284c7);color:#fff;font-weight:700;text-decoration:none;cursor:pointer}.primary:disabled{opacity:.65}.error{display:flex;align-items:center;gap:9px;margin-bottom:20px;padding:12px 14px;border:1px solid rgba(239,68,68,.3);border-radius:11px;background:rgba(239,68,68,.1);color:#fca5a5;font-size:13px}.back{display:block;margin-top:20px;text-align:center;color:#94a3b8;text-decoration:none;font-size:14px}@media(max-width:520px){.card{padding:34px 24px}}
  `}</style></main>;
}
