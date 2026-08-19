"use client";

import Link from "next/link";
import { useState } from "react";
import { registerUser, sendSignupOtp } from "@/services/authService";
import BrandLogo from "@/app/components/BrandLogo";
import { FaBell, FaChartLine, FaCheckCircle, FaClipboardList, FaEnvelope, FaExclamationTriangle, FaEye, FaEyeSlash, FaLock, FaShieldAlt, FaUser, FaUserMd } from "react-icons/fa";

const ROLES = [
  { value: "PATIENT", label: "Patient", icon: <FaUser /> },
  { value: "DOCTOR", label: "Doctor", icon: <FaUserMd /> },
  { value: "ADMIN", label: "Admin", icon: <FaShieldAlt /> },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "PATIENT" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setMessage("");
      if (!otpSent) {
        await sendSignupOtp(form.email.trim());
        setOtpSent(true);
        setMessage(`A 6-digit verification code was sent to ${form.email.trim()}`);
        return;
      }
      await registerUser({ ...form, email: form.email.trim(), otp });
      setMessage("Account created! Redirecting to login...");
      setForm({ fullName: "", email: "", password: "", role: "PATIENT" });
      setOtp("");
      setOtpSent(false);
      setTimeout(() => { window.location.href = "/login"; }, 1400);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          display: flex;
          background: #0a0e1a;
        }

        .auth-left {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 60px;
          width: 50%;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #0d1b4b 0%, #0a2b5e 40%, #0e4a8e 100%);
        }
        @media (min-width: 900px) { .auth-left { display: flex; } }

        .auth-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.2;
          pointer-events: none;
        }
        .blob1 { width: 450px; height: 450px; background: #3b82f6; top: -120px; right: -80px; }
        .blob2 { width: 300px; height: 300px; background: #06b6d4; bottom: -80px; left: -60px; }

        .auth-brand {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 52px; z-index: 1;
        }
        .auth-brand-icon {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
        }
        .auth-brand-name { font-size: 22px; font-weight: 700; color: #fff; }

        .auth-hero-title {
          font-size: clamp(30px, 3vw, 46px);
          font-weight: 800; color: #fff;
          line-height: 1.1; letter-spacing: -1.5px;
          margin-bottom: 20px; z-index: 1;
        }
        .auth-hero-title span {
          background: linear-gradient(90deg, #60a5fa, #22d3ee);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .auth-hero-sub {
          font-size: 16px; color: rgba(255,255,255,0.55);
          line-height: 1.65; max-width: 380px; z-index: 1;
          margin-bottom: 48px;
        }

        .auth-feature-list { z-index: 1; display: flex; flex-direction: column; gap: 16px; }
        .auth-feature {
          display: flex; align-items: flex-start; gap: 14px;
        }
        .auth-feature-icon {
          width: 38px; height: 38px; min-width: 38px;
          background: rgba(59,130,246,0.15);
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px;
        }
        .auth-feature-text { }
        .auth-feature-title { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 2px; }
        .auth-feature-desc { font-size: 12px; color: rgba(255,255,255,0.45); }

        /* Right */
        .auth-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px 24px;
          background: #0a0e1a;
          overflow-y: auto;
        }
        .auth-card { width: 100%; max-width: 420px; padding: 8px 0; }

        .auth-mobile-brand {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 36px; justify-content: center;
        }
        @media (min-width: 900px) { .auth-mobile-brand { display: none; } }
        .auth-mobile-brand-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .auth-mobile-brand-name { font-size: 18px; font-weight: 700; color: #fff; }

        .auth-card-title {
          font-size: 26px; font-weight: 800;
          color: #fff; letter-spacing: -0.8px;
          margin-bottom: 6px;
        }
        .auth-card-sub {
          font-size: 14px; color: rgba(255,255,255,0.4);
          margin-bottom: 32px;
        }

        .auth-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          padding: 12px 16px; border-radius: 12px;
          font-size: 13px; margin-bottom: 20px;
        }
        .auth-success {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.3);
          color: #86efac;
          padding: 12px 16px; border-radius: 12px;
          font-size: 13px; margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }

        .auth-field { margin-bottom: 18px; }
        .auth-label {
          display: block; font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.55); margin-bottom: 8px;
        }
        .auth-email-change {
          margin-top: 7px; padding: 0; border: 0; background: none;
          color: #60a5fa; font-size: 12px; cursor: pointer;
        }
        .auth-input:disabled { opacity: 0.65; cursor: not-allowed; }
        .auth-input-wrap { position: relative; }
        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 13px 16px;
          color: #fff;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: all 0.2s;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.22); }
        .auth-input:focus {
          border-color: #3b82f6;
          background: rgba(59,130,246,0.08);
          box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
        }
        .auth-input.has-icon { padding-left: 44px; }
        .auth-input.has-eye { padding-right: 44px; }
        .auth-input-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.28); font-size: 15px;
          pointer-events: none;
        }
        .auth-eye-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.3);
          padding: 4px; transition: color 0.2s;
        }
        .auth-eye-btn:hover { color: rgba(255,255,255,0.7); }

        .auth-role-label {
          display: block; font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.55); margin-bottom: 10px;
        }
        .auth-role-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 10px; margin-bottom: 24px;
        }
        .auth-role-btn {
          padding: 14px 8px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: rgba(255,255,255,0.45);
          font-size: 13px; font-weight: 500;
          font-family: 'Inter', sans-serif;
          cursor: pointer; text-align: center;
          transition: all 0.2s;
        }
        .auth-role-btn:hover {
          border-color: rgba(59,130,246,0.35);
          color: rgba(255,255,255,0.75);
          background: rgba(59,130,246,0.07);
        }
        .auth-role-btn.active {
          border-color: #3b82f6;
          background: rgba(59,130,246,0.15);
          color: #93c5fd;
        }
        .auth-role-icon { font-size: 22px; display: block; margin-bottom: 6px; }

        .auth-btn {
          width: 100%;
          background: linear-gradient(135deg, #2563eb, #0284c7);
          border: none; border-radius: 12px;
          padding: 15px;
          color: #fff; font-size: 15px; font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer; letter-spacing: 0.3px;
          transition: all 0.2s;
          box-shadow: 0 4px 24px rgba(37,99,235,0.35);
          position: relative; overflow: hidden;
        }
        .auth-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 32px rgba(37,99,235,0.45); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .auth-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-bottom-link {
          text-align: center; font-size: 14px;
          color: rgba(255,255,255,0.4); margin-top: 24px;
        }
        .auth-bottom-link a {
          color: #60a5fa; font-weight: 600;
          text-decoration: none; margin-left: 4px;
        }
        .auth-bottom-link a:hover { color: #93c5fd; }

        .auth-terms {
          font-size: 12px; color: rgba(255,255,255,0.3);
          text-align: center; margin-top: 16px; line-height: 1.6;
        }
        .auth-terms a { color: rgba(96,165,250,0.7); text-decoration: none; }
        .auth-terms a:hover { color: #60a5fa; }
      `}</style>

      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-blob blob1" />
        <div className="auth-blob blob2" />

        <div className="auth-brand">
          <div className="auth-brand-icon"><BrandLogo size={48} /></div>
          <span className="auth-brand-name">MediCore HMS</span>
        </div>

        <h1 className="auth-hero-title">
          Join the future of<br />
          <span>healthcare management.</span>
        </h1>
        <p className="auth-hero-sub">
          Create your account and access a powerful platform designed for modern hospitals and healthcare providers.
        </p>

        <div className="auth-feature-list">
          <div className="auth-feature">
            <div className="auth-feature-icon"><FaChartLine /></div>
            <div className="auth-feature-text">
              <div className="auth-feature-title">Real-time Dashboards</div>
              <div className="auth-feature-desc">Live analytics for appointments, revenue and patient flow</div>
            </div>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon"><FaBell /></div>
            <div className="auth-feature-text">
              <div className="auth-feature-title">Instant Notifications</div>
              <div className="auth-feature-desc">WebSocket-powered alerts for every critical event</div>
            </div>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon"><FaLock /></div>
            <div className="auth-feature-text">
              <div className="auth-feature-title">Secure by Default</div>
              <div className="auth-feature-desc">JWT + refresh tokens, role-based access control</div>
            </div>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon"><FaClipboardList /></div>
            <div className="auth-feature-text">
              <div className="auth-feature-title">Digital Prescriptions</div>
              <div className="auth-feature-desc">Generate, sign and share PDF prescriptions instantly</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-mobile-brand">
            <div className="auth-mobile-brand-icon"><BrandLogo size={40} /></div>
            <span className="auth-mobile-brand-name">MediCore HMS</span>
          </div>

          <h1 className="auth-card-title">Create your account</h1>
          <p className="auth-card-sub">Fill in the details below to get started</p>

          {error && <div className="auth-error"><FaExclamationTriangle /> {error}</div>}
          {message && <div className="auth-success"><FaCheckCircle /> {message}</div>}

          <form onSubmit={handleRegister}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-name">Full name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FaUser /></span>
                <input
                  id="reg-name" type="text" name="fullName"
                  value={form.fullName} onChange={handleChange}
                  placeholder="Dr. Jane Smith"
                  className="auth-input has-icon"
                  required autoComplete="name"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-email">Email address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FaEnvelope /></span>
                <input
                  id="reg-email" type="email" name="email"
                  value={form.email} onChange={handleChange}
                  placeholder="you@example.com"
                  className="auth-input has-icon"
                  required autoComplete="email" disabled={otpSent}
                />
              </div>
              {otpSent && <button type="button" className="auth-email-change" onClick={() => { setOtpSent(false); setOtp(""); setMessage(""); }}>Use a different email</button>}
            </div>

            {otpSent && <div className="auth-field">
              <label className="auth-label" htmlFor="reg-otp">Email verification code</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FaShieldAlt /></span>
                <input id="reg-otp" type="text" inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter 6-digit code" className="auth-input has-icon" required pattern="\d{6}" autoComplete="one-time-code" />
              </div>
            </div>}

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FaLock /></span>
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="auth-input has-icon has-eye"
                  required minLength={8} autoComplete="new-password"
                />
                <button
                  type="button" className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <span className="auth-role-label">I am a...</span>
              <div className="auth-role-grid">
                {ROLES.map((r) => (
                  <button
                    key={r.value} type="button"
                    className={`auth-role-btn ${form.role === r.value ? "active" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, role: r.value }))}
                  >
                    <span className="auth-role-icon">{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              <span className="auth-btn-inner">
                {loading
                  ? <><span className="auth-spinner" /> {otpSent ? "Verifying..." : "Sending code..."}</>
                  : otpSent ? "Verify & Create Account" : "Send Verification Code"}
              </span>
            </button>
          </form>

          <div className="auth-terms">
            By registering you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>

          <div className="auth-bottom-link">
            Already have an account?
            <Link href="/login">Sign in &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
