"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

interface ProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProjectModal({ onClose, onSuccess }: ProjectModalProps) {
  const { triggerToast } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerToast("Project name is required", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (res.ok) {
        triggerToast("Project created successfully!", "success");
        onSuccess();
        onClose();
      } else {
        triggerToast(data.error || "Failed to create project", "error");
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
          width: "480px",
          borderRadius: "16px",
          padding: "28px",
          position: "relative",
          animation: "float 0s",
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
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Create New Project</h3>
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
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label htmlFor="proj-name">Project Name</label>
            <input
              id="proj-name"
              type="text"
              placeholder="e.g. Mobile App Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="proj-desc">Description (Optional)</label>
            <textarea
              id="proj-desc"
              placeholder="Provide a high-level summary of this project's goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              rows={4}
              style={{ resize: "none" }}
            />
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "8px",
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
              {submitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
