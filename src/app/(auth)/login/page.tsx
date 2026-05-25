"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Layers } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function LoginPage() {
  const { login, triggerToast } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      triggerToast("All fields are required", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        triggerToast("Logged in successfully!", "success");
        login(data.user);
      } else {
        triggerToast(data.error || "Login failed", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-primary)",
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)",
        padding: "20px",
      }}
    >
      <div
        className="glass fade-in"
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "16px",
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          border: "1px solid rgba(255, 255, 255, 0.04)",
        }}
      >
        {/* Brand Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-violet) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
            }}
          >
            <Layers size={22} color="#fff" />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.5px" }}>Welcome to Aether</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center" }}>
            Sign in to track projects, tasks, and team milestones.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              autoFocus
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="login-pass">Password</label>
            </div>
            <input
              id="login-pass"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="glow-btn"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "0.95rem",
              marginTop: "8px",
            }}
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Redirect toggle */}
        <div style={{ fontSize: "0.85rem", textAlign: "center", color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link
            href="/signup"
            style={{
              color: "var(--accent-indigo)",
              textDecoration: "none",
              fontWeight: 600,
              transition: "var(--transition-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-violet)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--accent-indigo)")}
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
