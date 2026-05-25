"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Folder, 
  Plus, 
  LogOut, 
  User, 
  Layers
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

interface Project {
  id: string;
  name: string;
}

interface SidebarProps {
  activeProjectId?: string;
  onCreateProjectClick?: () => void;
  refreshTrigger?: number;
}

export default function Sidebar({ activeProjectId, onCreateProjectClick, refreshTrigger = 0 }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects);
        }
      } catch (err) {
        console.error("Sidebar project loading failed:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchProjects();
    }
  }, [user, refreshTrigger]);

  return (
    <aside
      className="glass"
      style={{
        width: "280px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border-color)",
        zIndex: 100,
        backgroundColor: "rgba(10, 11, 16, 0.4)",
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "24px 28px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-violet) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)",
          }}
        >
          <Layers size={18} color="#fff" />
        </div>
        <span
          style={{
            fontSize: "1.3rem",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            background: "linear-gradient(135deg, #fff 40%, var(--text-secondary) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          AETHER
        </span>
      </div>

      {/* Navigation */}
      <div
        style={{
          flex: 1,
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          overflowY: "auto",
        }}
      >
        {/* Main Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "8px",
              color: pathname === "/dashboard" ? "var(--text-primary)" : "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
              backgroundColor: pathname === "/dashboard" ? "rgba(255, 255, 255, 0.04)" : "transparent",
              border: pathname === "/dashboard" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid transparent",
              transition: "var(--transition-fast)",
            }}
            className="sidebar-link"
          >
            <LayoutDashboard size={18} color={pathname === "/dashboard" ? "var(--accent-indigo)" : "currentColor"} />
            Dashboard
          </Link>
        </div>

        {/* Projects Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              Projects
            </span>
            {onCreateProjectClick && (
              <button
                onClick={onCreateProjectClick}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                  borderRadius: "4px",
                  transition: "var(--transition-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Plus size={14} />
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {loading ? (
              <div style={{ padding: "12px 16px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Loading...
              </div>
            ) : projects.length === 0 ? (
              <div style={{ padding: "12px 16px", fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                No active projects
              </div>
            ) : (
              projects.map((proj) => {
                const isActive = activeProjectId === proj.id;
                return (
                  <Link
                    key={proj.id}
                    href={`/projects/${proj.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      backgroundColor: isActive ? "rgba(255, 255, 255, 0.03)" : "transparent",
                      border: isActive ? "1px solid rgba(255, 255, 255, 0.03)" : "1px solid transparent",
                      transition: "var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Folder size={16} color={isActive ? "var(--accent-violet)" : "currentColor"} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {proj.name}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Profile Footer */}
      {user && (
        <div
          style={{
            padding: "20px 16px",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={16} color="var(--text-secondary)" />
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.email}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.05)",
              border: "1px solid rgba(239, 68, 68, 0.15)",
              color: "#f87171",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.05)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.15)";
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
