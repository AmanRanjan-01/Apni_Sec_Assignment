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
    createdAt: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchUser = useCallback(async () => {
        try {
            const res = await apiFetch("/api/auth/me");
            if (!res.ok) {
                router.push("/login");
                return;
            }
            const data = await res.json();
            setUser(data.data.user);
            setName(data.data.user.name || "");
            setEmail(data.data.user.email);
        } catch {
            router.push("/login");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleLogout = async () => {
        await apiFetch("/api/auth/logout", { method: "POST", skipRefresh: true });
        router.push("/login");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const res = await apiFetch("/api/users/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to update profile");
                return;
            }

            setUser(data.data.user);
            setSuccess("Profile updated successfully!");
        } catch {
            setError("An error occurred");
        } finally {
            setSaving(false);
        }
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
                        className="btn btn-ghost"
                        style={{ width: "100%", justifyContent: "flex-start", marginBottom: "8px" }}
                    >
                        📊 Dashboard
                    </Link>
                    <Link
                        href="/profile"
                        className="btn"
                        style={{
                            width: "100%",
                            justifyContent: "flex-start",
                            background: "rgba(0, 212, 255, 0.1)",
                            color: "var(--color-accent-primary)",
                            marginBottom: "8px",
                        }}
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
                    <h1 className="page-title">Profile</h1>
                    <p className="page-description">Manage your account settings</p>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                    }}
                >
                    {/* Profile Form */}
                    <div className="card" style={{ padding: "32px" }}>
                        <h2
                            style={{
                                fontSize: "18px",
                                fontWeight: "600",
                                marginBottom: "24px",
                            }}
                        >
                            Personal Information
                        </h2>

                        {error && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    className="input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className="input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving ? (
                                    <span className="loader" style={{ width: "16px", height: "16px" }} />
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Account Info */}
                    <div className="card" style={{ padding: "32px" }}>
                        <h2
                            style={{
                                fontSize: "18px",
                                fontWeight: "600",
                                marginBottom: "24px",
                            }}
                        >
                            Account Details
                        </h2>

                        <div style={{ marginBottom: "20px" }}>
                            <div
                                style={{
                                    color: "var(--color-text-muted)",
                                    fontSize: "12px",
                                    marginBottom: "4px",
                                }}
                            >
                                User ID
                            </div>
                            <div
                                style={{
                                    fontFamily: "monospace",
                                    fontSize: "13px",
                                    padding: "8px 12px",
                                    background: "var(--color-bg-primary)",
                                    borderRadius: "var(--radius-sm)",
                                }}
                            >
                                {user?.id}
                            </div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <div
                                style={{
                                    color: "var(--color-text-muted)",
                                    fontSize: "12px",
                                    marginBottom: "4px",
                                }}
                            >
                                Role
                            </div>
                            <div>
                                <span className="badge badge-cloud">{user?.role}</span>
                            </div>
                        </div>

                        <div>
                            <div
                                style={{
                                    color: "var(--color-text-muted)",
                                    fontSize: "12px",
                                    marginBottom: "4px",
                                }}
                            >
                                Member Since
                            </div>
                            <div>
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })
                                    : "N/A"}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
