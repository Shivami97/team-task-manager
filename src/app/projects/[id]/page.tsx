"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  UserPlus, 
  Trash2, 
  Users, 
  Calendar,
  User, 
  Folder 
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import TaskModal from "@/components/Modals/TaskModal";
import InviteModal from "@/components/Modals/InviteModal";
import ProjectModal from "@/components/Modals/ProjectModal";

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string;
  assigneeId: string | null;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  members: Member[];
  tasks: Task[];
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading, triggerToast } = useAuth();
  const router = useRouter();

  // Project details states
  const [project, setProject] = useState<Project | null>(null);
  const [userRole, setUserRole] = useState("MEMBER");
  const [dataLoading, setDataLoading] = useState(true);

  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);

  const fetchProjectDetails = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();

      if (res.ok) {
        setProject(data.project);
        setUserRole(data.userRole);
      } else {
        triggerToast(data.error || "Failed to load project details", "error");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      triggerToast("An error occurred loading project details", "error");
      router.push("/dashboard");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchProjectDetails();
      }
    }
  }, [user, authLoading, id]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        if (newStatus === "COMPLETED") {
          triggerToast("🏆 Task completed! Awesome job!", "success");
        } else {
          triggerToast(`Task moved to ${newStatus.replace("_", " ")}`, "success");
        }
        // Update local state instantly for extreme responsiveness
        setProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            tasks: prev.tasks.map((t) =>
              t.id === taskId ? { ...t, status: newStatus } : t
            ),
          };
        });
      } else {
        triggerToast(data.error || "Failed to update status", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("An error occurred updating task status", "error");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        triggerToast("Task deleted successfully", "success");
        setProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            tasks: prev.tasks.filter((t) => t.id !== taskId),
          };
        });
      } else {
        const data = await res.json();
        triggerToast(data.error || "Failed to delete task", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("An error occurred deleting task", "error");
    }
  };

  const handleDeleteProject = async () => {
    if (confirm("⚠️ WARNING: Are you sure you want to permanently delete this project? This will erase all tasks and project memberships. This action CANNOT be undone.")) {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          triggerToast("Project deleted successfully", "success");
          router.push("/dashboard");
        } else {
          const data = await res.json();
          triggerToast(data.error || "Failed to delete project", "error");
        }
      } catch (err) {
        console.error(err);
        triggerToast("An error occurred deleting project", "error");
      }
    }
  };

  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setShowTaskModal(true);
  };

  const handleCreateClick = () => {
    setTaskToEdit(null);
    setShowTaskModal(true);
  };

  const handleProjectSuccess = () => {
    setSidebarRefresh((prev) => prev + 1);
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
              borderTopColor: "var(--accent-violet)",
              animation: "pulseGlow 1.2s infinite linear",
            }}
          />
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Loading project board...
          </span>
        </div>
      </div>
    );
  }

  if (!project) return null;
  const isAdmin = userRole === "ADMIN";

  return (
    <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "var(--bg-primary)" }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeProjectId={id}
        onCreateProjectClick={() => setShowProjectModal(true)}
        refreshTrigger={sidebarRefresh}
      />

      {/* Main Board Space */}
      <div
        style={{
          marginLeft: "280px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        {/* Top Header navbar */}
        <header
          style={{
            padding: "24px 40px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "60%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Folder size={18} color="var(--accent-indigo)" />
              <h1
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {project.name}
              </h1>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  backgroundColor: isAdmin ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
                  color: isAdmin ? "var(--accent-indigo)" : "var(--text-secondary)",
                  border: `1px solid ${isAdmin ? "rgba(99,102,241,0.2)" : "var(--border-color)"}`,
                }}
              >
                {userRole} Role
              </span>
            </div>
            {project.description && (
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {project.description}
              </p>
            )}
          </div>

          {/* Action Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isAdmin && (
              <>
                <button
                  onClick={() => setShowInviteModal(true)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    background: "rgba(255,255,255,0.02)",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)")}
                >
                  <UserPlus size={14} />
                  Add Team
                </button>

                <button
                  onClick={handleCreateClick}
                  className="glow-btn"
                  style={{
                    padding: "10px 18px",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Plus size={16} />
                  Create Task
                </button>

                <div
                  style={{
                    width: "1px",
                    height: "24px",
                    backgroundColor: "var(--border-color)",
                    margin: "0 4px",
                  }}
                />

                <button
                  onClick={handleDeleteProject}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#f87171",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "var(--transition-fast)",
                  }}
                  title="Delete Project Workspace"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Board layout workspace split */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Left panel: Kanban Grid */}
          <main style={{ flex: 1, padding: "28px 40px", overflowY: "auto" }}>
            <KanbanBoard
              tasks={project.tasks}
              userRole={userRole}
              onEditClick={handleEditClick}
              onStatusChange={handleStatusChange}
              onDeleteClick={handleDeleteTask}
            />
          </main>

          {/* Right sidebar: Team list */}
          <aside
            style={{
              width: "280px",
              borderLeft: "1px solid var(--border-color)",
              padding: "28px 24px",
              backgroundColor: "rgba(10, 11, 16, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Users size={16} color="var(--accent-violet)" />
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Team Members ({project.members.length})</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {project.members.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {m.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>

                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={m.user.name}
                    >
                      {m.user.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={m.user.email}
                    >
                      {m.user.email}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      backgroundColor:
                        m.role === "ADMIN"
                          ? "rgba(99, 102, 241, 0.08)"
                          : "rgba(255,255,255,0.02)",
                      color:
                        m.role === "ADMIN"
                          ? "var(--accent-indigo)"
                          : "var(--text-secondary)",
                      border: `1px solid ${
                        m.role === "ADMIN"
                          ? "rgba(99, 102, 241, 0.15)"
                          : "rgba(255,255,255,0.03)"
                      }`,
                    }}
                  >
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* Global Modals overlay containers */}
      {showTaskModal && (
        <TaskModal
          projectId={id}
          taskToEdit={taskToEdit}
          members={project.members}
          userRole={userRole}
          onClose={() => setShowTaskModal(false)}
          onSuccess={fetchProjectDetails}
        />
      )}

      {showInviteModal && (
        <InviteModal
          projectId={id}
          onClose={() => setShowInviteModal(false)}
          onSuccess={fetchProjectDetails}
        />
      )}

      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          onSuccess={handleProjectSuccess}
        />
      )}
    </div>
  );
}
