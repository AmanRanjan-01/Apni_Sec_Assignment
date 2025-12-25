"use client";

/**
 * API Client with automatic token refresh
 * Wraps fetch to automatically refresh tokens on 401 errors
 */

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
    try {
        const response = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
        });

        if (response.ok) {
            return true;
        }

        // Refresh failed, redirect to login
        return false;
    } catch {
        return false;
    }
}

async function handleRefresh(): Promise<boolean> {
    // If already refreshing, wait for the existing promise
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = refreshTokens();

    try {
        const result = await refreshPromise;
        return result;
    } finally {
        isRefreshing = false;
        refreshPromise = null;
    }
}

interface FetchOptions extends RequestInit {
    skipRefresh?: boolean;
}

/**
 * Fetch wrapper that automatically refreshes tokens on 401 errors
 */
export async function apiFetch(
    url: string,
    options: FetchOptions = {}
): Promise<Response> {
    const { skipRefresh, ...fetchOptions } = options;

    // Make the initial request
    let response = await fetch(url, {
        ...fetchOptions,
        credentials: "include",
    });

    // If we get a 401 and haven't skipped refresh, try to refresh
    if (response.status === 401 && !skipRefresh) {
        const refreshed = await handleRefresh();

        if (refreshed) {
            // Retry the original request with the new token
            response = await fetch(url, {
                ...fetchOptions,
                credentials: "include",
            });
        } else {
            // Refresh failed, redirect to login
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
    }

    return response;
}

/**
 * Helper for JSON API calls
 */
export async function apiJson<T = unknown>(
    url: string,
    options: FetchOptions = {}
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
    try {
        const response = await apiFetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        const data = await response.json();

        return {
            ok: response.ok,
            status: response.status,
            data: response.ok ? data.data : null,
            error: !response.ok ? data.error : undefined,
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            data: null,
            error: error instanceof Error ? error.message : "Network error",
        };
    }
}
