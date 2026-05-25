"use client";

import React from "react";
import TaskCard from "./TaskCard";

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

interface KanbanBoardProps {
  tasks: Task[];
  userRole: string; // "ADMIN" or "MEMBER"
  onEditClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onDeleteClick: (taskId: string) => Promise<void>;
}

interface ColumnConfig {
  id: string;
  title: string;
  color: string;
}

const COLUMNS: ColumnConfig[] = [
  { id: "TODO", title: "To Do", color: "var(--color-todo)" },
  { id: "IN_PROGRESS", title: "In Progress", color: "var(--color-in-progress)" },
  { id: "IN_REVIEW", title: "In Review", color: "var(--color-in-review)" },
  { id: "COMPLETED", title: "Completed", color: "var(--color-completed)" },
];

export default function KanbanBoard({
  tasks,
  userRole,
  onEditClick,
  onStatusChange,
  onDeleteClick,
}: KanbanBoardProps) {
  
  const getTasksByStatus = (status: string) => {
    return tasks.filter((t) => t.status === status);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "20px",
        height: "calc(100vh - 210px)",
        alignItems: "stretch",
      }}
    >
      {COLUMNS.map((col) => {
        const columnTasks = getTasksByStatus(col.id);
        
        return (
          <div
            key={col.id}
            className="glass"
            style={{
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              height: "100%",
              backgroundColor: "rgba(15, 16, 22, 0.45)",
              border: "1px solid rgba(255, 255, 255, 0.02)",
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "8px",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: col.color,
                    boxShadow: `0 0 8px ${col.color}`,
                  }}
                />
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {col.title}
                </h4>
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  padding: "2px 8px",
                  borderRadius: "100px",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-secondary)",
                }}
              >
                {columnTasks.length}
              </span>
            </div>

            {/* Column Body: Scrollable list of cards */}
            <div
              className="column-scroll-container"
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                paddingRight: "4px",
                minHeight: "150px",
              }}
            >
              {columnTasks.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed rgba(255, 255, 255, 0.02)",
                    borderRadius: "12px",
                    padding: "20px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.8rem",
                    fontStyle: "italic",
                  }}
                >
                  Empty Column
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    userRole={userRole}
                    onEditClick={onEditClick}
                    onStatusChange={onStatusChange}
                    onDeleteClick={onDeleteClick}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
