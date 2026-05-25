"use client";

import React from "react";
import { CheckCircle, AlertCircle, Clock, ListTodo } from "lucide-react";

interface Stats {
  total: number;
  completed: number;
  pending: number;
  todo: number;
  inProgress: number;
  inReview: number;
  overdue: number;
}

interface DashboardStatsProps {
  stats: Stats;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  // Calculate completion percentage
  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  // Radial Progress Ring parameters
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        marginBottom: "24px",
      }}
    >
      {/* Metric 1: Total Tasks */}
      <div
        className="glass"
        style={{
          padding: "20px",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          position: "relative",
          backgroundColor: "rgba(22, 24, 34, 0.2)",
          border: "1px solid rgba(255,255,255,0.02)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "10px",
            backgroundColor: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ListTodo size={20} color="var(--accent-indigo)" />
        </div>
        <div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            Total Assigned
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{stats.total}</div>
        </div>
      </div>

      {/* Metric 2: Completed */}
      <div
        className="glass"
        style={{
          padding: "20px",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          position: "relative",
          backgroundColor: "rgba(22, 24, 34, 0.2)",
          border: "1px solid rgba(255,255,255,0.02)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "10px",
            backgroundColor: "rgba(52, 211, 153, 0.08)",
            border: "1px solid rgba(52, 211, 153, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle size={20} color="var(--color-completed)" />
        </div>
        <div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            Completed Tasks
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{stats.completed}</div>
        </div>
      </div>

      {/* Metric 3: Pending */}
      <div
        className="glass"
        style={{
          padding: "20px",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          position: "relative",
          backgroundColor: "rgba(22, 24, 34, 0.2)",
          border: "1px solid rgba(255,255,255,0.02)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "10px",
            backgroundColor: "rgba(251, 191, 36, 0.08)",
            border: "1px solid rgba(251, 191, 36, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Clock size={20} color="var(--color-in-progress)" />
        </div>
        <div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            Pending Tasks
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{stats.pending}</div>
        </div>
      </div>

      {/* Metric 4: Overdue */}
      <div
        className="glass"
        style={{
          padding: "20px",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          position: "relative",
          backgroundColor: "rgba(22, 24, 34, 0.2)",
          border: "1px solid rgba(255,255,255,0.02)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "10px",
            backgroundColor: "rgba(248, 113, 113, 0.08)",
            border: "1px solid rgba(248, 113, 113, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertCircle size={20} color="var(--color-overdue)" />
        </div>
        <div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            Overdue Tasks
          </div>
          <div
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              color: stats.overdue > 0 ? "var(--color-overdue)" : "var(--text-primary)",
            }}
          >
            {stats.overdue}
          </div>
        </div>
      </div>

      {/* Radial Completion Percentage Graphic */}
      <div
        className="glass"
        style={{
          padding: "20px",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          position: "relative",
          backgroundColor: "rgba(22, 24, 34, 0.2)",
          border: "1px solid rgba(255,255,255,0.02)",
          gridColumn: "1 / -1", // Span full row in smaller layouts
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Task Completion Velocity</h4>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Keep knocking out tasks to see your completion rings fill up!
          </p>
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg height={radius * 2} width={radius * 2}>
            <circle
              stroke="rgba(255,255,255,0.02)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="url(#gradient)"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset, transition: "stroke-dashoffset 0.8s ease-in-out" }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-indigo)" />
                <stop offset="100%" stopColor="var(--accent-violet)" />
              </linearGradient>
            </defs>
          </svg>
          <div
            style={{
              position: "absolute",
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--text-primary)",
            }}
          >
            {completionPercentage}%
          </div>
        </div>
      </div>
    </div>
  );
}
