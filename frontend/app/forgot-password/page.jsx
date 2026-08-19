"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaArrowLeft, FaCheck, FaEnvelope, FaExclamationTriangle, FaLock } from "react-icons/fa";
import { API_BASE } from "@/utils/constants";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to send the reset link. Please try again.");
      }
      setSent(true);
    } catch (requestError) {
      setError(requestError.message || "Unable to connect to the server.");
    } finally { setLoading(false); }
  };

  return (
    <main className="forgot-page">
      <div className="forgot-card">
        <div className="brand">
          <Image src="/medicore-logo.png" alt="MediCore logo" width={48} height={48} priority />
          <span>MediCore HMS</span>
        </div>
        {!sent ? <>
          <div className="status-icon"><FaLock aria-hidden="true" /></div>
          <h1>Forgot password?</h1>
          <p className="subtitle">Enter your email address and we&apos;ll send you a secure link to reset your password.</p>
          {error && <div className="message error"><FaExclamationTriangle aria-hidden="true" /><span>{error}</span></div>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <div className="input-wrap"><FaEnvelope aria-hidden="true" /><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></div>
            <button type="submit" disabled={loading}>{loading && <span className="spinner" />}{loading ? "Sending..." : "Send Reset Link"}</button>
          </form>
          <div className="divider"><span />Remember your password?<span /></div>
          <Link className="back-link" href="/login"><FaArrowLeft aria-hidden="true" /> Back to Sign In</Link>
        </> : <>
          <div className="status-icon success"><FaCheck aria-hidden="true" /></div>
          <h1>Check your email</h1>
          <p className="subtitle">If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link. The link expires in 30 minutes.</p>
          <Link className="primary-link" href="/login">Back to Sign In</Link>
          <button className="text-button" type="button" onClick={() => { setSent(false); setError(""); }}>Didn&apos;t receive it? Try again</button>
        </>}
      </div>
      <style jsx>{`
        .forgot-page{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 0%,rgba(37,99,235,.15),transparent 38%),#080d19;color:#fff;font-family:Inter,Arial,sans-serif}.forgot-card{width:100%;max-width:480px;padding:44px 42px;border:1px solid rgba(148,163,184,.16);border-radius:24px;background:rgba(15,23,42,.86);box-shadow:0 24px 80px rgba(0,0,0,.28)}
        .brand{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:38px;font-size:21px;font-weight:750}.brand :global(img){object-fit:contain}.status-icon{width:72px;height:72px;display:grid;place-items:center;margin:0 auto 26px;border:1px solid rgba(59,130,246,.35);border-radius:20px;background:rgba(59,130,246,.12);color:#60a5fa;font-size:28px}.status-icon.success{border-radius:50%;border-color:rgba(34,197,94,.35);background:rgba(34,197,94,.12);color:#4ade80}
        h1{margin:0 0 10px;text-align:center;font-size:28px;letter-spacing:-.7px}.subtitle{max-width:350px;margin:0 auto 30px;text-align:center;color:#94a3b8;font-size:14px;line-height:1.65}.subtitle strong{color:#60a5fa;overflow-wrap:anywhere}label{display:block;margin-bottom:8px;color:#a7b0c0;font-size:13px;font-weight:600}.input-wrap{display:flex;align-items:center;gap:12px;padding:0 15px;margin-bottom:22px;border:1px solid rgba(148,163,184,.22);border-radius:12px;background:rgba(255,255,255,.05);color:#64748b;transition:.2s}.input-wrap:focus-within{border-color:#3b82f6;box-shadow:0 0 0 4px rgba(59,130,246,.12)}input{width:100%;padding:15px 0;border:0;outline:0;background:transparent;color:#fff;font:inherit}input::placeholder{color:#64748b}
        form>button,.primary-link{width:100%;min-height:50px;display:flex;align-items:center;justify-content:center;gap:9px;border:0;border-radius:12px;background:linear-gradient(135deg,#2563eb,#0284c7);color:#fff;font-size:15px;font-weight:700;text-decoration:none;cursor:pointer;box-shadow:0 8px 26px rgba(37,99,235,.3)}form>button:disabled{opacity:.65;cursor:not-allowed}.spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.message{display:flex;align-items:center;gap:9px;margin-bottom:20px;padding:12px 14px;border-radius:11px;font-size:13px;line-height:1.45}.error{border:1px solid rgba(239,68,68,.3);background:rgba(239,68,68,.1);color:#fca5a5}
        .divider{display:flex;align-items:center;gap:12px;margin:25px 0 20px;color:#64748b;font-size:12px;white-space:nowrap}.divider span{width:100%;height:1px;background:rgba(148,163,184,.14)}.back-link{display:flex;align-items:center;justify-content:center;gap:7px;color:#94a3b8;text-decoration:none;font-size:14px}.back-link:hover{color:#fff}.text-button{display:block;margin:20px auto 0;border:0;background:none;color:#60a5fa;cursor:pointer}@media(max-width:520px){.forgot-card{padding:34px 24px}}
      `}</style>
    </main>
  );
}
