"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  triggerToast: (message: string, type?: "success" | "error" | "info") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname]);

  const login = (newUser: User) => {
    setUser(newUser);
    router.push("/dashboard");
  };

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        triggerToast("Logged out successfully", "success");
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
      triggerToast("Failed to logout. Please try again.", "error");
    }
  };

  const triggerToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, triggerToast }}>
      {children}
      
      {/* Premium Floating Toasts Container */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="glass"
            style={{
              padding: "14px 20px",
              borderRadius: "8px",
              minWidth: "280px",
              maxWidth: "380px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              animation: "fadeIn 0.25s forwards",
              pointerEvents: "auto",
              borderLeft: `4px solid ${
                toast.type === "success"
                  ? "var(--color-completed)"
                  : toast.type === "error"
                  ? "var(--color-overdue)"
                  : "var(--accent-indigo)"
              }`,
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor:
                  toast.type === "success"
                    ? "var(--color-completed)"
                    : toast.type === "error"
                    ? "var(--color-overdue)"
                    : "var(--accent-indigo)",
                boxShadow: `0 0 10px ${
                  toast.type === "success"
                    ? "var(--color-completed)"
                    : toast.type === "error"
                    ? "var(--color-overdue)"
                    : "var(--accent-indigo)"
                }`,
              }}
            />
            <div style={{ flex: 1, fontSize: "0.9rem", fontWeight: 500 }}>
              {toast.message}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                padding: "2px",
              }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
