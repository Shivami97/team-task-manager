"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FolderPlus, 
  Clock, 
  ArrowRight, 
  Calendar, 
  CircleDot, 
  ExternalLink 
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import DashboardStats from "@/components/DashboardStats";
import ProjectModal from "@/components/Modals/ProjectModal";

interface Stats {
  total: number;
  completed: number;
  pending: number;
  todo: number;
  inProgress: number;
  inReview: number;
  overdue: number;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
  status: string;
  project: {
    id: string;
    name: string;
  };
}

interface RecentProject {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count: {
    tasks: number;
    members: number;
  };
}

export default function DashboardPage() {
  const { user, loading: authLoading, triggerToast } = useAuth();
  const router = useRouter();

  // Component states
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    pending: 0,
    todo: 0,
    inProgress: 0,
    inReview: 0,
    overdue: 0,
  });
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setUpcomingTasks(data.upcomingTasks);
        setRecentProjects(data.recentProjects);
      } else {
        triggerToast("Failed to load dashboard metrics", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("An error occurred loading dashboard", "error");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchDashboardData();
      }
    }
  }, [user, authLoading, router]);

  const handleProjectSuccess = () => {
    setSidebarRefresh((prev) => prev + 1);
    fetchDashboardData();
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case "HIGH": return "var(--priority-high)";
      case "MEDIUM": return "var(--priority-medium)";
      case "LOW": return "var(--priority-low)";
      default: return "var(--text-secondary)";
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.05)",
              borderTopColor: "var(--accent-indigo)",
              animation: "pulseGlow 1.2s infinite linear",
            }}
          />
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "var(--bg-primary)" }}>
      {/* Sidebar navigation */}
      <Sidebar 
        onCreateProjectClick={() => setShowProjectModal(true)} 
        refreshTrigger={sidebarRefresh} 
      />

      {/* Main Content Area */}
      <main
        style={{
          marginLeft: "280px",
          flex: 1,
          padding: "40px",
          overflowY: "auto",
          maxWidth: "1400px",
        }}
        className="fade-in"
      >
        {/* Top Header Section */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "36px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Dashboard</h1>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Welcome back, <span style={{ fontWeight: 600, color: "#fff" }}>{user?.name}</span>! Here's your workspace rundown.
            </p>
          </div>

          <button
            onClick={() => setShowProjectModal(true)}
            className="glow-btn"
            style={{
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.9rem",
            }}
          >
            <FolderPlus size={16} />
            New Project
          </button>
        </header>

        {/* Core Statistics grid */}
        <DashboardStats stats={stats} />

        {/* Dashboard split details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "28px",
            marginTop: "28px",
          }}
        >
          {/* Urgent tasks panel */}
          <div
            className="glass"
            style={{
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.02)",
              backgroundColor: "rgba(15, 16, 22, 0.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
                <Clock size={16} color="var(--accent-indigo)" />
                My Urgent Tasks
              </h3>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                {upcomingTasks.length} pending
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {upcomingTasks.length === 0 ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                    border: "1.5px dashed rgba(255,255,255,0.02)",
                    borderRadius: "12px",
                  }}
                >
                  🎉 All caught up! No impending tasks assigned.
                </div>
              ) : (
                upcomingTasks.map((t) => {
                  const overdue = new Date(t.dueDate) < new Date();
                  return (
                    <div
                      key={t.id}
                      style={{
                        padding: "16px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(255,255,255,0.01)",
                        border: "1px solid var(--border-color)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "var(--transition-fast)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)";
                        e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.01)";
                        e.currentTarget.style.borderColor = "var(--border-color)";
                      }}
                      onClick={() => router.push(`/projects/${t.project.id}`)}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "70%" }}>
                        <h4
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t.title}
                        </h4>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          <span style={{ color: "var(--accent-violet)", fontWeight: 600 }}>{t.project.name}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <CircleDot size={8} color={getPriorityColor(t.priority)} />
                            {t.priority}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.78rem",
                            color: overdue ? "var(--color-overdue)" : "var(--text-secondary)",
                            fontWeight: overdue ? 600 : 400,
                          }}
                        >
                          <Calendar size={12} />
                          {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "100px",
                            backgroundColor:
                              t.status === "IN_PROGRESS"
                                ? "var(--color-in-progress-bg)"
                                : t.status === "IN_REVIEW"
                                ? "var(--color-in-review-bg)"
                                : "rgba(255,255,255,0.03)",
                            color:
                              t.status === "IN_PROGRESS"
                                ? "var(--color-in-progress)"
                                : t.status === "IN_REVIEW"
                                ? "var(--color-in-review)"
                                : "var(--text-secondary)",
                            border: `1px solid ${
                              t.status === "IN_PROGRESS"
                                ? "rgba(251,191,36,0.15)"
                                : t.status === "IN_REVIEW"
                                ? "rgba(192,132,252,0.15)"
                                : "rgba(255,255,255,0.04)"
                            }`,
                          }}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent projects panel */}
          <div
            className="glass"
            style={{
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.02)",
              backgroundColor: "rgba(15, 16, 22, 0.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Recent Projects</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentProjects.length === 0 ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                    border: "1.5px dashed rgba(255,255,255,0.02)",
                    borderRadius: "12px",
                  }}
                >
                  Create a project to start assigning tasks!
                </div>
              ) : (
                recentProjects.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255,255,255,0.01)",
                      border: "1px solid var(--border-color)",
                      cursor: "pointer",
                      transition: "var(--transition-fast)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)";
                      e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.01)";
                      e.currentTarget.style.borderColor = "var(--border-color)";
                    }}
                    onClick={() => router.push(`/projects/${p.id}`)}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>{p.name}</h4>
                      <ExternalLink size={14} color="var(--text-muted)" />
                    </div>

                    {p.description && (
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.description}
                      </p>
                    )}

                    <div style={{ display: "flex", gap: "16px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      <span>{p._count.members} team members</span>
                      <span>{p._count.tasks} total tasks</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Project Creation modal popup */}
      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          onSuccess={handleProjectSuccess}
        />
      )}
    </div>
  );
}
