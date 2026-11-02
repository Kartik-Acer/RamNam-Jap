"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import "./account.css";

export default function AccountPage() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdSuccess, setPwdSuccess] = useState("");
    const [pwdError, setPwdError] = useState("");

    const fetchUserProfile = useCallback(async (token) => {
        try {
            const response = await fetch("/api/users/profile", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    router.push("/login");
                    return;
                }
                return;
            }

            startTransition(() => {
                setUser(data.user);
            });

            // Update user in localStorage
            localStorage.setItem("user", JSON.stringify(data.user));

        } catch (error) {
            console.error("Failed to load profile:", error);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const cachedUser = localStorage.getItem("user");

        if (!token) {
            router.push("/login");
            return;
        }

        if (cachedUser) {
            try {
                const parsed = JSON.parse(cachedUser);
                startTransition(() => {
                    setUser(parsed);
                });
            } catch (e) {
                console.error(e);
            }
        }

        startTransition(() => {
            fetchUserProfile(token);
        });
    }, [router, fetchUserProfile]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwdError("");
        setPwdSuccess("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPwdError("Please fill in all password fields.");
            return;
        }

        if (newPassword.length < 4) {
            setPwdError("New password must be at least 4 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPwdError("New passwords do not match.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        setPwdLoading(true);

        try {
            const response = await fetch("/api/users/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setPwdError(data.message || "Failed to change password.");
                return;
            }

            setPwdSuccess("Password changed successfully! Keep it safe for your next login.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (error) {
            console.error("Change password error:", error);
            setPwdError("Unable to update password. Please check your connection.");
        } finally {
            setPwdLoading(false);
        }
    };

    const handleLogout = () => {
        if (user) {
            localStorage.removeItem(`unsavedJap_${user.sadhakNo}`);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (loading && !user) {
        return (
            <main className="account-page">
                <div className="container text-center py-5">
                    <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading your account details...</p>
                </div>
            </main>
        );
    }

    if (!user) {
        return null;
    }

    const totalJap = user.japCount || 0;
    const malas = Math.floor(totalJap / 108);
    const remainingBeads = totalJap % 108;

    return (
        <main className="account-page">
            <div className="container" style={{ maxWidth: "860px" }}>

                {/* Header */}
                <header className="account-header">
                    <div>
                        <h1 className="account-brand-title">॥ श्री राम ॥</h1>
                        <p className="account-brand-sub">Sadhak Account Portal</p>
                    </div>

                    <div className="account-nav-actions">
                        <Link href="/jap" className="btn-jap-back">
                            <span>←</span> Back to Chanting
                        </Link>

                        <button onClick={handleLogout} className="btn-account-logout">
                            Logout
                        </button>
                    </div>
                </header>

                {/* Profile Overview Card */}
                <div className="account-profile-card">
                    <div className="d-flex align-items-center gap-3">
                        <div className="profile-avatar-circle">
                            {user.name ? user.name.charAt(0).toUpperCase() : "र"}
                        </div>

                        <div>
                            <h2 className="h4 mb-1 fw-bold text-dark" style={{ color: "#54301b" }}>
                                {user.name}
                            </h2>

                            <div className="sadhak-badge">
                                <span>Sadhak No.</span>
                                <strong>#{user.sadhakNo}</strong>
                            </div>

                            {user.createdAt && (
                                <div className="text-muted small mt-2">
                                    Joined on {new Date(user.createdAt).toLocaleDateString("en-IN", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lifetime Submitted Stats */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <div className="stat-card-highlight">
                            <div className="stat-label">Total Submitted Jap</div>
                            <div className="stat-number-primary">
                                {totalJap.toLocaleString()}
                            </div>
                            <p className="stat-subtext">
                                Verified chants offered to Lord Rama
                            </p>
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="stat-card-highlight">
                            <div className="stat-label">Total Malas Completed</div>
                            <div className="stat-number-primary">
                                {malas.toLocaleString()}
                            </div>
                            <p className="stat-subtext">
                                {remainingBeads > 0
                                    ? `+ ${remainingBeads} beads towards next Mala`
                                    : "Complete Mala cycle completed"}
                            </p>
                            <span className="stat-badge-golden">
                                1 Mala = 108 Chants
                            </span>
                        </div>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="account-form-card">
                    <h3 className="form-card-title">
                        <span>🔒</span> Change Password
                    </h3>
                    <p className="form-card-sub">
                        Keep your Sadhak account secure with a strong password.
                    </p>

                    {pwdError && (
                        <div className="alert alert-danger py-2 px-3 small" role="alert">
                            {pwdError}
                        </div>
                    )}

                    {pwdSuccess && (
                        <div className="alert alert-success py-2 px-3 small" role="alert">
                            {pwdSuccess}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange}>
                        <div className="mb-3 account-input-group">
                            <label htmlFor="currentPassword">Current Password</label>
                            <input
                                id="currentPassword"
                                type="password"
                                className="account-input"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                required
                            />
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-12 col-md-6 account-input-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    className="account-input"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    minLength={4}
                                    required
                                />
                                <small className="text-muted d-block mt-1">
                                    At least 4 characters
                                </small>
                            </div>

                            <div className="col-12 col-md-6 account-input-group">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className="account-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-update-pwd w-100"
                            disabled={pwdLoading}
                        >
                            {pwdLoading ? "Updating Password..." : "Update Password"}
                        </button>
                    </form>
                </div>

            </div>
        </main>
    );
}
