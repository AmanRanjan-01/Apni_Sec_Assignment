"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed");
                return;
            }

            router.push("/dashboard");
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
            }}
        >
            <div style={{ width: "100%", maxWidth: "420px" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <Link
                        href="/"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "10px",
                            fontSize: "24px",
                            fontWeight: "700",
                            color: "var(--color-text-primary)",
                            textDecoration: "none",
                        }}
                    >
                        <span>🛡️</span>
                        <span>ApniSec</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="card" style={{ padding: "40px" }}>
                    <h1
                        style={{
                            fontSize: "24px",
                            fontWeight: "700",
                            textAlign: "center",
                            marginBottom: "8px",
                        }}
                    >
                        Welcome Back
                    </h1>
                    <p
                        style={{
                            color: "var(--color-text-secondary)",
                            textAlign: "center",
                            marginBottom: "32px",
                            fontSize: "14px",
                        }}
                    >
                        Sign in to your account to continue
                    </p>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: "100%", marginTop: "8px" }}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loader" style={{ width: "20px", height: "20px" }} />
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <p
                        style={{
                            textAlign: "center",
                            marginTop: "24px",
                            color: "var(--color-text-secondary)",
                            fontSize: "14px",
                        }}
                    >
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            style={{ color: "var(--color-accent-primary)", textDecoration: "none" }}
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
