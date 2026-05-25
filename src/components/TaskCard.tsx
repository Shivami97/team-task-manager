"use client";

import React, { useState } from "react";
import { Calendar, User, Clock, Trash2, Edit } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string;
  assigneeId: string | null;
  assignee: UserInfo | null;
  creator: UserInfo;
}

interface TaskCardProps {
  task: Task;
  userRole: string; // "ADMIN" or "MEMBER"
  onEditClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onDeleteClick: (taskId: string) => Promise<void>;
}

export default function TaskCard({
  task,
  userRole,
  onEditClick,
  onStatusChange,
  onDeleteClick,
}: TaskCardProps) {
  const { triggerToast } = useAuth();
  const isAdmin = userRole === "ADMIN";
  const [updating, setUpdating] = useState(false);

  const isOverdue =
    task.status !== "COMPLETED" && new Date(task.dueDate) < new Date();

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case "HIGH":
        return "var(--priority-high)";
      case "MEDIUM":
        return "var(--priority-medium)";
      case "LOW":
        return "var(--priority-low)";
      default:
        return "var(--text-secondary)";
    }
  };

  const handleQuickStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      await onStatusChange(task.id, newStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this task?")) {
      setUpdating(true);
      try {
        await onDeleteClick(task.id);
      } catch (err) {
        console.error(err);
      } finally {
        setUpdating(false);
      }
    }
  };

  return (
    <div
      className="glass"
      style={{
        padding: "18px",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        position: "relative",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        backgroundColor: "rgba(22, 24, 34, 0.35)",
        transition: "var(--transition-normal)",
        opacity: updating ? 0.6 : 1,
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.25)";
        e.currentTarget.style.backgroundColor = "rgba(22, 24, 34, 0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.04)";
        e.currentTarget.style.backgroundColor = "rgba(22, 24, 34, 0.35)";
      }}
    >
      {/* Card Header: Priority badge and admin actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: getPriorityColor(task.priority),
            backgroundColor: `rgba(${
              task.priority === "HIGH"
                ? "248, 113, 113"
                : task.priority === "MEDIUM"
                ? "251, 146, 60"
                : "148, 163, 184"
            }, 0.1)`,
            padding: "4px 10px",
            borderRadius: "100px",
            border: `1px solid rgba(${
              task.priority === "HIGH"
                ? "248, 113, 113"
                : task.priority === "MEDIUM"
                ? "251, 146, 60"
                : "148, 163, 184"
            }, 0.25)`,
          }}
        >
          {task.priority} Priority
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => onEditClick(task)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              transition: "var(--transition-fast)",
            }}
            title="Edit Task"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Edit size={14} />
          </button>
          
          {isAdmin && (
            <button
              onClick={handleDelete}
              style={{
                background: "none",
                border: "none",
                color: "#f87171",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                transition: "var(--transition-fast)",
              }}
              title="Delete Task"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Task Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h4
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.3,
          }}
        >
          {task.title}
        </h4>
        {task.description && (
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.4,
            }}
          >
            {task.description}
          </p>
        )}
      </div>

      {/* Timeline info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "0.78rem",
          color: isOverdue ? "var(--color-overdue)" : "var(--text-muted)",
          backgroundColor: isOverdue ? "var(--color-overdue-bg)" : "rgba(255, 255, 255, 0.01)",
          padding: isOverdue ? "4px 8px" : "0",
          borderRadius: isOverdue ? "6px" : "0",
          width: "fit-content",
        }}
      >
        <Calendar size={13} />
        <span style={{ fontWeight: isOverdue ? 600 : 400 }}>
          {isOverdue ? "Overdue: " : "Due: "}
          {formatDate(task.dueDate)}
        </span>
      </div>

      {/* Separator */}
      <div style={{ height: "1px", backgroundColor: "var(--border-color)", margin: "4px 0" }} />

      {/* Footer: Assignee avatar & Quick-status selector */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        {/* Assignee initials badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }} title={task.assignee ? `Assigned to ${task.assignee.name}` : "Unassigned"}>
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              backgroundColor: task.assignee
                ? "rgba(139, 92, 246, 0.15)"
                : "rgba(255,255,255,0.02)",
              border: `1px solid ${task.assignee ? "rgba(139, 92, 246, 0.3)" : "var(--border-color)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: task.assignee ? "var(--accent-violet)" : "var(--text-muted)",
            }}
          >
            {task.assignee ? (
              task.assignee.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()
            ) : (
              <User size={12} />
            )}
          </div>
          <span
            style={{
              fontSize: "0.8rem",
              color: task.assignee ? "var(--text-secondary)" : "var(--text-muted)",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "80px",
            }}
          >
            {task.assignee ? task.assignee.name.split(" ")[0] : "Unassigned"}
          </span>
        </div>

        {/* Quick status change dropdown */}
        <select
          value={task.status}
          onChange={handleQuickStatusChange}
          disabled={updating}
          style={{
            width: "auto",
            padding: "4px 26px 4px 10px",
            fontSize: "0.78rem",
            fontWeight: 600,
            borderRadius: "6px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-color)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
    </div>
  );
}
