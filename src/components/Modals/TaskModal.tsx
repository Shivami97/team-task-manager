"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

interface ProjectMember {
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
}

interface TaskModalProps {
  projectId: string;
  taskToEdit?: Task;
  members: ProjectMember[];
  userRole: string; // "ADMIN" or "MEMBER"
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskModal({
  projectId,
  taskToEdit,
  members,
  userRole,
  onClose,
  onSuccess,
}: TaskModalProps) {
  const { triggerToast } = useAuth();
  const isEditMode = !!taskToEdit;
  const isMember = userRole === "MEMBER";

  // Form states
  const [title, setTitle] = useState(taskToEdit?.title || "");
  const [description, setDescription] = useState(taskToEdit?.description || "");
  const [status, setStatus] = useState(taskToEdit?.status || "TODO");
  const [priority, setPriority] = useState(taskToEdit?.priority || "MEDIUM");
  
  // Format initial due date to YYYY-MM-DD
  const formatInitialDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };
  const [dueDate, setDueDate] = useState(formatInitialDate(taskToEdit?.dueDate));
  const [assigneeId, setAssigneeId] = useState(taskToEdit?.assigneeId || "");
  
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      triggerToast("Task title is required", "error");
      return;
    }
    if (!dueDate) {
      triggerToast("Due date is required", "error");
      return;
    }

    setSubmitting(true);
    try {
      let url = `/api/projects/${projectId}/tasks`;
      let method = "POST";
      
      const payload: any = isEditMode
        ? isMember
          ? { status } // Members can only change status
          : { title, description, status, priority, dueDate, assigneeId: assigneeId || null }
        : { title, description, status, priority, dueDate, assigneeId: assigneeId || null };

      if (isEditMode) {
        url = `/api/tasks/${taskToEdit.id}`;
        method = "PATCH";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        triggerToast(
          isEditMode ? "Task updated successfully!" : "Task created successfully!",
          "success"
        );
        onSuccess();
        onClose();
      } else {
        triggerToast(data.error || "Failed to save task", "error");
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
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(5px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.2s forwards",
      }}
      onClick={onClose}
    >
      <div
        className="glass"
        style={{
          width: "520px",
          borderRadius: "16px",
          padding: "28px",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
            {isEditMode ? (isMember ? "Update Task Status" : "Edit Task Details") : "Create New Task"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {isMember && isEditMode ? (
            // Simplified form for team members (only edit status)
            <div>
              <label htmlFor="task-status">Task Status</label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={submitting}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <p style={{ marginTop: "12px", fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                As a project member, you are only permitted to update the completion status of this task.
              </p>
            </div>
          ) : (
            // Full form for admins or creating a new task
            <>
              <div>
                <label htmlFor="task-title">Task Title</label>
                <input
                  id="task-title"
                  type="text"
                  placeholder="e.g. Design Login UI"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={submitting}
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="task-desc">Description (Optional)</label>
                <textarea
                  id="task-desc"
                  placeholder="Provide subtasks, links, or context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                  rows={3}
                  style={{ resize: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label htmlFor="task-status-full">Status</label>
                  <select
                    id="task-status-full"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="task-priority">Priority</label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label htmlFor="task-date">Due Date</label>
                  <input
                    id="task-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="task-assignee">Assignee</label>
                  <select
                    id="task-assignee"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name} ({m.user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "12px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "transparent",
                color: "var(--text-secondary)",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "var(--transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="glow-btn"
              style={{
                padding: "10px 24px",
                fontSize: "0.9rem",
              }}
            >
              {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
