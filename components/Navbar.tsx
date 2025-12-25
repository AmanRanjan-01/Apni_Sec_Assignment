"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface User {
    id: string;
    email: string;
    name: string | null;
}

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await apiFetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.data.user);
                }
            } catch {
                // Not logged in
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const handleLogout = async () => {
        await apiFetch("/api/auth/logout", { method: "POST", skipRefresh: true });
        setUser(null);
        router.refresh();
    };

    return (
        <nav className="navbar" role="navigation" aria-label="Main navigation">
            <div className="container navbar-content">
                <Link href="/" className="navbar-logo" aria-label="ApniSec Home">
                    <span role="img" aria-label="Shield">🛡️</span>
                    <span>ApniSec</span>
                </Link>

                <div className="navbar-links">
                    <Link href="#features" className="navbar-link">
                        Features
                    </Link>
                    <Link href="#services" className="navbar-link">
                        Services
                    </Link>
                    <Link href="#about" className="navbar-link">
                        About
                    </Link>
                    <Link href="#contact" className="navbar-link">
                        Contact
                    </Link>
                </div>

                <div className="navbar-actions">
                    {loading ? (
                        <div className="loader" style={{ width: "20px", height: "20px" }} />
                    ) : user ? (
                        <>
                            <Link href="/dashboard" className="btn btn-ghost">
                                Dashboard
                            </Link>
                            <button onClick={handleLogout} className="btn btn-secondary">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="btn btn-ghost">
                                Login
                            </Link>
                            <Link href="/register" className="btn btn-primary">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
