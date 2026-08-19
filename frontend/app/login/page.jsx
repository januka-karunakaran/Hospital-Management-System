"use client";

import Link from "next/link";
import { useState } from "react";
import { loginUser } from "@/services/authService";
import { saveSession } from "@/utils/auth";
import BrandLogo from "@/app/components/BrandLogo";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle } from "react-icons/fa";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const data = await loginUser(form);
      saveSession(data);
      if (data.role === "ADMIN") window.location.href = "/dashboard";
      else if (data.role === "DOCTOR") window.location.href = "/doctor/dashboard";
      else if (data.role === "PATIENT") window.location.href = "/patient/dashboard";
      else window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
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

        /* Left panel */
        .auth-left {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 60px;
          width: 55%;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #0d1b4b 0%, #0a2b5e 40%, #0e4a8e 100%);
        }
        @media (min-width: 900px) { .auth-left { display: flex; } }

        .auth-left-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          pointer-events: none;
        }
        .blob1 { width: 500px; height: 500px; background: #3b82f6; top: -150px; right: -100px; }
        .blob2 { width: 350px; height: 350px; background: #06b6d4; bottom: -100px; left: -80px; }
        .blob3 { width: 200px; height: 200px; background: #8b5cf6; top: 50%; right: 60px; }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 60px;
          z-index: 1;
        }
        .auth-brand-icon {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
        }
        .auth-brand-name {
          font-size: 22px; font-weight: 700;
          color: #fff; letter-spacing: -0.3px;
        }

        .auth-hero-title {
          font-size: clamp(32px, 3.5vw, 52px);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin-bottom: 24px;
          z-index: 1;
        }
        .auth-hero-title span {
          background: linear-gradient(90deg, #60a5fa, #22d3ee);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .auth-hero-sub {
          font-size: 17px; color: rgba(255,255,255,0.6);
          line-height: 1.6; max-width: 400px; z-index: 1;
          margin-bottom: 56px;
        }

        .auth-stats {
          display: flex; gap: 32px; z-index: 1;
        }
        .auth-stat { display: flex; flex-direction: column; gap: 4px; }
        .auth-stat-num {
          font-size: 28px; font-weight: 800; color: #fff;
          letter-spacing: -1px;
        }
        .auth-stat-label { font-size: 13px; color: rgba(255,255,255,0.5); }

        .auth-divider-v {
          width: 1px; background: rgba(255,255,255,0.15);
          height: 48px; align-self: center;
        }

        /* Decorative card */
        .auth-deco-card {
          position: absolute;
          bottom: 60px; right: 60px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 20px 24px;
          backdrop-filter: blur(20px);
          z-index: 1;
          min-width: 220px;
        }
        .auth-deco-card-title {
          font-size: 12px; color: rgba(255,255,255,0.5);
          margin-bottom: 10px; letter-spacing: 0.5px; text-transform: uppercase;
        }
        .auth-deco-item {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 10px;
        }
        .auth-deco-dot {
          width: 8px; height: 8px; border-radius: 50%;
        }
        .auth-deco-text { font-size: 13px; color: rgba(255,255,255,0.75); }

        /* Right panel */
        .auth-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px 24px;
          background: #0a0e1a;
          position: relative;
          overflow: hidden;
        }
        .auth-right::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%);
          top: -200px; right: -200px;
          pointer-events: none;
        }

        .auth-card {
          width: 100%; max-width: 420px;
          z-index: 1;
        }

        .auth-mobile-brand {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 40px; justify-content: center;
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
          font-size: 28px; font-weight: 800;
          color: #fff; letter-spacing: -0.8px;
          margin-bottom: 6px;
        }
        .auth-card-sub {
          font-size: 14px; color: rgba(255,255,255,0.45);
          margin-bottom: 36px;
        }

        .auth-error {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          padding: 12px 16px; border-radius: 12px;
          font-size: 13px; margin-bottom: 24px;
          display: flex; align-items: center; gap: 8px;
        }

        .auth-success {
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.3);
          color: #86efac;
          padding: 12px 16px; border-radius: 12px;
          font-size: 13px; margin-bottom: 24px;
        }

        .auth-field {
          margin-bottom: 20px;
        }
        .auth-label {
          display: block; font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.6); margin-bottom: 8px;
          letter-spacing: 0.2px;
        }
        .auth-input-wrap {
          position: relative;
        }
        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          color: #fff;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.25); }
        .auth-input:focus {
          border-color: #3b82f6;
          background: rgba(59,130,246,0.08);
          box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
        }
        .auth-input-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.3); font-size: 16px;
          pointer-events: none;
        }
        .auth-input.has-icon { padding-left: 44px; }
        .auth-eye-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.3); font-size: 16px;
          padding: 4px;
          transition: color 0.2s;
        }
        .auth-eye-btn:hover { color: rgba(255,255,255,0.7); }
        .auth-input.has-eye { padding-right: 44px; }

        .auth-row {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 28px;
        }
        .auth-check-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: rgba(255,255,255,0.5);
          cursor: pointer;
        }
        .auth-check-label input[type=checkbox] { accent-color: #3b82f6; }
        .auth-forgot {
          font-size: 13px; color: #60a5fa;
          text-decoration: none;
          transition: color 0.2s;
        }
        .auth-forgot:hover { color: #93c5fd; }

        .auth-btn {
          width: 100%;
          background: linear-gradient(135deg, #2563eb, #0284c7);
          border: none; border-radius: 12px;
          padding: 15px;
          color: #fff;
          font-size: 15px; font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(37,99,235,0.35);
          position: relative; overflow: hidden;
        }
        .auth-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .auth-btn:hover:not(:disabled)::before { opacity: 1; }
        .auth-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 32px rgba(37,99,235,0.45); }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-btn-inner {
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 28px 0;
        }
        .auth-divider-line {
          flex: 1; height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .auth-divider-text {
          font-size: 12px; color: rgba(255,255,255,0.25);
          white-space: nowrap;
        }

        .auth-bottom-link {
          text-align: center; font-size: 14px;
          color: rgba(255,255,255,0.45);
        }
        .auth-bottom-link a {
          color: #60a5fa; font-weight: 600;
          text-decoration: none; margin-left: 4px;
          transition: color 0.2s;
        }
        .auth-bottom-link a:hover { color: #93c5fd; }

        .auth-select {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          color: #fff;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          appearance: none;
          cursor: pointer;
        }
        .auth-select option { background: #1e293b; color: #fff; }
        .auth-select:focus {
          border-color: #3b82f6;
          background: rgba(59,130,246,0.08);
          box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
        }

        .auth-role-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .auth-role-btn {
          padding: 12px 8px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: rgba(255,255,255,0.5);
          font-size: 13px; font-weight: 500;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }
        .auth-role-btn:hover {
          border-color: rgba(59,130,246,0.4);
          color: rgba(255,255,255,0.8);
          background: rgba(59,130,246,0.08);
        }
        .auth-role-btn.active {
          border-color: #3b82f6;
          background: rgba(59,130,246,0.15);
          color: #93c5fd;
        }
        .auth-role-icon { font-size: 20px; display: block; margin-bottom: 4px; }
      `}</style>

      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-brand-icon blob1 auth-left-blob" />
        <div className="auth-brand-icon blob2 auth-left-blob" />
        <div className="auth-brand-icon blob3 auth-left-blob" />

        <div className="auth-brand">
          <div className="auth-brand-icon">
            <BrandLogo size={48} />
          </div>
          <span className="auth-brand-name">MediCore HMS</span>
        </div>

        <h1 className="auth-hero-title">
          Modern care,<br />
          <span>smarter systems.</span>
        </h1>
        <p className="auth-hero-sub">
          A unified platform for doctors, patients and administrators to deliver exceptional healthcare outcomes.
        </p>

        <div className="auth-stats">
          <div className="auth-stat">
            <span className="auth-stat-num">12k+</span>
            <span className="auth-stat-label">Patients served</span>
          </div>
          <div className="auth-divider-v" />
          <div className="auth-stat">
            <span className="auth-stat-num">340+</span>
            <span className="auth-stat-label">Doctors</span>
          </div>
          <div className="auth-divider-v" />
          <div className="auth-stat">
            <span className="auth-stat-num">98%</span>
            <span className="auth-stat-label">Satisfaction</span>
          </div>
        </div>

        <div className="auth-deco-card">
          <div className="auth-deco-card-title">System status</div>
          <div className="auth-deco-item">
            <div className="auth-deco-dot" style={{background:"#22c55e"}} />
            <span className="auth-deco-text">All services operational</span>
          </div>
          <div className="auth-deco-item">
            <div className="auth-deco-dot" style={{background:"#22c55e"}} />
            <span className="auth-deco-text">Real-time notifications live</span>
          </div>
          <div className="auth-deco-item" style={{marginBottom:0}}>
            <div className="auth-deco-dot" style={{background:"#f59e0b"}} />
            <span className="auth-deco-text">Scheduled maintenance: Sun 2 AM</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          {/* Mobile brand */}
          <div className="auth-mobile-brand">
            <div className="auth-mobile-brand-icon">
              <BrandLogo size={40} />
            </div>
            <span className="auth-mobile-brand-name">MediCore HMS</span>
          </div>

          <h1 className="auth-card-title">Welcome back</h1>
          <p className="auth-card-sub">Sign in to your account to continue</p>

          {error && (
            <div className="auth-error" style={{ display: "flex", alignItems: "center" }}>
              <FaExclamationTriangle style={{ marginRight: "8px", flexShrink: 0 }} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">Email address</label>
              <div className="auth-input-wrap">
                <FaEnvelope className="auth-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="auth-input has-icon"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <FaLock className="auth-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="auth-input has-icon has-eye"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="auth-row">
              <label className="auth-check-label">
                <input type="checkbox" />
                Remember me
              </label>
              <Link href="/forgot-password" className="auth-forgot">Forgot password?</Link>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              <span className="auth-btn-inner">
                {loading ? <><span className="auth-spinner" /> Signing in...</> : "Sign In"}
              </span>
            </button>
          </form>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">Don&apos;t have an account?</span>
            <div className="auth-divider-line" />
          </div>

          <div className="auth-bottom-link">
            New to MediCore?
            <Link href="/register">Create an account &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
