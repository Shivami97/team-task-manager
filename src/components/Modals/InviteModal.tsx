"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

interface InviteModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteModal({ projectId, onClose, onSuccess }: InviteModalProps) {
  const { triggerToast } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      triggerToast("Email address is required", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (res.ok) {
        triggerToast("Member added to team successfully!", "success");
        onSuccess();
        onClose();
      } else {
        triggerToast(data.error || "Failed to invite member", "error");
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
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Add Team Member</h3>
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

        {/* Info Alert */}
        <div
          className="glass"
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            marginBottom: "20px",
            borderLeft: "3px solid var(--accent-indigo)",
            backgroundColor: "rgba(99, 102, 241, 0.05)",
          }}
        >
          Enter the registered email address of the team member you want to add to this project.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label htmlFor="invite-email">Email Address</label>
            <input
              id="invite-email"
              type="email"
              placeholder="e.g. member@aether.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="invite-role">Project Role</label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={submitting}
            >
              <option value="MEMBER">Member (Can update task statuses only)</option>
              <option value="ADMIN">Admin (Can manage tasks, invite team, delete project)</option>
            </select>
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
              {submitting ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
