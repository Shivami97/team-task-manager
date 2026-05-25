"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Layers } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
      }}
    >
      <div
        className="glass"
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-violet) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)",
          animation: "float 4s ease-in-out infinite",
        }}
      >
        <Layers size={38} color="#fff" />
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "1px" }} className="gradient-text">
          AETHER
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Loading your workspace...
        </p>
      </div>

      {/* Modern Spinner */}
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.05)",
          borderTopColor: "var(--accent-indigo)",
          animation: "pulseGlow 1.5s infinite linear",
        }}
      />
    </div>
  );
}
