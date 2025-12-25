"use client";

import Link from "next/link";
import { useState, useEffect, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
}

interface Issue {
    id: string;
    type: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
}

const typeLabels: Record<string, string> = {
    CLOUD_SECURITY: "Cloud Security",
    RETEAM_ASSESSMENT: "Red Team",
    VAPT: "VAPT",
};

const statusClasses: Record<string, string> = {
    OPEN: "badge-open",
    IN_PROGRESS: "badge-in-progress",
    RESOLVED: "badge-resolved",
    CLOSED: "badge-closed",
};

const typeClasses: Record<string, string> = {
    CLOUD_SECURITY: "badge-cloud",
    RETEAM_ASSESSMENT: "badge-reteam",
    VAPT: "badge-vapt",
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState("");
    const [error, setError] = useState("");

    // Form state
    const [formType, setFormType] = useState("CLOUD_SECURITY");
    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formPriority, setFormPriority] = useState("MEDIUM");
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    // Edit state
    const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

    const fetchUser = useCallback(async () => {
        try {
            const res = await apiFetch("/api/auth/me");
            if (!res.ok) {
                router.push("/login");
                return;
            }
            const data = await res.json();
            setUser(data.data.user);
        } catch {
            router.push("/login");
        }
    }, [router]);

    const fetchIssues = useCallback(async () => {
        try {
            const url = filter ? `/api/issues?type=${filter}` : "/api/issues";
            const res = await apiFetch(url);
            if (res.ok) {
                const data = await res.json();
                setIssues(data.data.issues);
            }
        } catch {
            setError("Failed to load issues");
        }
    }, [filter]);

    useEffect(() => {
        const init = async () => {
            await fetchUser();
            await fetchIssues();
            setLoading(false);
        };
        init();
    }, [fetchUser, fetchIssues]);

    const handleLogout = async () => {
        await apiFetch("/api/auth/logout", { method: "POST", skipRefresh: true });
        router.push("/login");
    };

    const handleCreateIssue = async (e: FormEvent) => {
        e.preventDefault();
        setFormError("");
        setFormLoading(true);

        try {
            const res = await apiFetch("/api/issues", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: formType,
                    title: formTitle,
                    description: formDescription,
                    priority: formPriority,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setFormError(data.error || "Failed to create issue");
                return;
            }

            setShowModal(false);
            setFormTitle("");
            setFormDescription("");
            fetchIssues();
        } catch {
            setFormError("An error occurred");
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateIssue = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingIssue) return;
        setFormError("");
        setFormLoading(true);

        try {
            const res = await apiFetch(`/api/issues/${editingIssue.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: formType,
                    title: formTitle,
                    description: formDescription,
                    priority: formPriority,
                    status: editingIssue.status,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setFormError(data.error || "Failed to update issue");
                return;
            }

            setEditingIssue(null);
            setShowModal(false);
            fetchIssues();
        } catch {
            setFormError("An error occurred");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteIssue = async (id: string) => {
        if (!confirm("Are you sure you want to delete this issue?")) return;

        try {
            await apiFetch(`/api/issues/${id}`, { method: "DELETE" });
            fetchIssues();
        } catch {
            setError("Failed to delete issue");
        }
    };

    const openEditModal = (issue: Issue) => {
        setEditingIssue(issue);
        setFormType(issue.type);
        setFormTitle(issue.title);
        setFormDescription(issue.description);
        setFormPriority(issue.priority);
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditingIssue(null);
        setFormType("CLOUD_SECURITY");
        setFormTitle("");
        setFormDescription("");
        setFormPriority("MEDIUM");
        setFormError("");
        setShowModal(true);
    };

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div className="loader" style={{ width: "40px", height: "40px" }} />
            </div>
        );
    }

    const openCount = issues.filter((i) => i.status === "OPEN").length;
    const inProgressCount = issues.filter((i) => i.status === "IN_PROGRESS").length;
    const resolvedCount = issues.filter((i) => i.status === "RESOLVED").length;

    return (
        <div className="dashboard">
            {/* Sidebar */}
            <aside className="sidebar">
                <Link
                    href="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "var(--color-text-primary)",
                        textDecoration: "none",
                        marginBottom: "40px",
                    }}
                >
                    <span>🛡️</span>
                    <span>ApniSec</span>
                </Link>

                <nav style={{ flex: 1 }}>
                    <Link
                        href="/dashboard"
                        className="btn"
                        style={{
                            width: "100%",
                            justifyContent: "flex-start",
                            background: "rgba(0, 212, 255, 0.1)",
                            color: "var(--color-accent-primary)",
                            marginBottom: "8px",
                        }}
                    >
                        📊 Dashboard
                    </Link>
                    <Link
                        href="/profile"
                        className="btn btn-ghost"
                        style={{ width: "100%", justifyContent: "flex-start", marginBottom: "8px" }}
                    >
                        👤 Profile
                    </Link>
                </nav>

                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "20px" }}>
                    <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                        <div style={{ color: "var(--color-text-secondary)", fontSize: "12px" }}>
                            Signed in as
                        </div>
                        <div style={{ fontWeight: "600" }}>{user?.name || user?.email}</div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn btn-ghost"
                        style={{ width: "100%", justifyContent: "flex-start" }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-description">
                        Welcome back, {user?.name || "there"}! Manage your security issues.
                    </p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {/* Stats */}
                <div className="stats-grid">
                    <div className="card stat-card">
                        <div className="stat-label">Total Issues</div>
                        <div className="stat-value gradient-text">{issues.length}</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-label">Open</div>
                        <div className="stat-value" style={{ color: "var(--color-info)" }}>
                            {openCount}
                        </div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-label">In Progress</div>
                        <div className="stat-value" style={{ color: "var(--color-warning)" }}>
                            {inProgressCount}
                        </div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-label">Resolved</div>
                        <div className="stat-value" style={{ color: "var(--color-success)" }}>
                            {resolvedCount}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "24px",
                        flexWrap: "wrap",
                        gap: "16px",
                    }}
                >
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <select
                            className="select"
                            style={{ width: "auto" }}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="CLOUD_SECURITY">Cloud Security</option>
                            <option value="RETEAM_ASSESSMENT">Red Team</option>
                            <option value="VAPT">VAPT</option>
                        </select>
                    </div>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        + New Issue
                    </button>
                </div>

                {/* Issues Table */}
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                                        <div style={{ color: "var(--color-text-muted)" }}>
                                            No issues found. Create your first issue!
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                issues.map((issue) => (
                                    <tr key={issue.id}>
                                        <td>
                                            <span className={`badge ${typeClasses[issue.type]}`}>
                                                {typeLabels[issue.type]}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: "500" }}>{issue.title}</td>
                                        <td>
                                            <span className={`badge ${statusClasses[issue.status]}`}>
                                                {issue.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td>{issue.priority}</td>
                                        <td style={{ color: "var(--color-text-muted)" }}>
                                            {new Date(issue.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-ghost"
                                                style={{ padding: "8px" }}
                                                onClick={() => openEditModal(issue)}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-ghost"
                                                style={{ padding: "8px" }}
                                                onClick={() => handleDeleteIssue(issue.id)}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingIssue ? "Edit Issue" : "Create Issue"}
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                ×
                            </button>
                        </div>
                        <form onSubmit={editingIssue ? handleUpdateIssue : handleCreateIssue}>
                            <div className="modal-body">
                                {formError && <div className="alert alert-error">{formError}</div>}

                                <div className="form-group">
                                    <label className="form-label">Issue Type</label>
                                    <select
                                        className="select"
                                        value={formType}
                                        onChange={(e) => setFormType(e.target.value)}
                                        required
                                    >
                                        <option value="CLOUD_SECURITY">Cloud Security</option>
                                        <option value="RETEAM_ASSESSMENT">Red Team Assessment</option>
                                        <option value="VAPT">VAPT</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input
                                        className="input"
                                        placeholder="Issue title"
                                        value={formTitle}
                                        onChange={(e) => setFormTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="input"
                                        placeholder="Describe the issue..."
                                        value={formDescription}
                                        onChange={(e) => setFormDescription(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Priority</label>
                                    <select
                                        className="select"
                                        value={formPriority}
                                        onChange={(e) => setFormPriority(e.target.value)}
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>

                                {editingIssue && (
                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="select"
                                            value={editingIssue.status}
                                            onChange={(e) =>
                                                setEditingIssue({ ...editingIssue, status: e.target.value })
                                            }
                                        >
                                            <option value="OPEN">Open</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="RESOLVED">Resolved</option>
                                            <option value="CLOSED">Closed</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={formLoading}
                                >
                                    {formLoading ? (
                                        <span className="loader" style={{ width: "16px", height: "16px" }} />
                                    ) : editingIssue ? (
                                        "Update Issue"
                                    ) : (
                                        "Create Issue"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
