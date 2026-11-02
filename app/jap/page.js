"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import "./jap.css";

export default function JapPage() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [databaseCount, setDatabaseCount] = useState(0);
    const [unsavedJap, setUnsavedJap] = useState(0);

    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Continuous floating Ram particles
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (!token || !savedUser) {
            router.push("/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(savedUser);

            startTransition(() => {
                setUser(parsedUser);
                setDatabaseCount(parsedUser.japCount || 0);

                const savedUnsavedJap = localStorage.getItem(
                    `unsavedJap_${parsedUser.sadhakNo}`
                );

                if (savedUnsavedJap) {
                    setUnsavedJap(Number(savedUnsavedJap));
                }
            });

        } catch (error) {
            console.error("Session load error:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
        }
    }, [router]);

    // Save unsaved jap count to localStorage so refresh or browser close preserves it
    useEffect(() => {
        if (!user) return;

        if (unsavedJap > 0) {
            localStorage.setItem(
                `unsavedJap_${user.sadhakNo}`,
                unsavedJap.toString()
            );
        } else {
            localStorage.removeItem(`unsavedJap_${user.sadhakNo}`);
        }
    }, [unsavedJap, user]);

    const handleJap = () => {
        // Increment pending count
        setUnsavedJap((prev) => prev + 1);

        // Haptic vibration feedback
        if (typeof window !== "undefined" && navigator.vibrate) {
            try {
                navigator.vibrate(12);
            } catch {
                // Ignore if browser restricts vibration
            }
        }

        // Spawn a new "राम" particle bursting forward from center of screen in 3D
        const particleId = Date.now() + Math.random();
        const randomX = (Math.random() - 0.5) * 80;

        setParticles((prev) => [
            ...prev.slice(-20), // maintain maximum 20 active particles for optimal frame rate
            {
                id: particleId,
                x: randomX,
                text: "राम"
            }
        ]);

        if (message) setMessage("");
    };

    const removeParticle = (id) => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
    };

    const handleSubmitJap = async () => {
        if (unsavedJap <= 0) return;

        setSubmitting(true);
        setMessage("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/login");
                return;
            }

            const response = await fetch("/api/users/jap", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    count: unsavedJap
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Jap submission failed.");
                return;
            }

            setDatabaseCount(data.japCount);
            setUnsavedJap(0);

            if (user) {
                localStorage.removeItem(`unsavedJap_${user.sadhakNo}`);

                const updatedUser = { ...user, japCount: data.japCount };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
            }

            setMessage("🙏 Jap submitted successfully to your lifetime total.");

        } catch (error) {
            console.error("Submit Jap error:", error);
            setMessage("Unable to submit Jap. Please check your internet connection.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = () => {
        if (user) {
            localStorage.removeItem(`unsavedJap_${user.sadhakNo}`);
        }
        setUnsavedJap(0);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (!user) {
        return null;
    }

    return (
        <main className="jap-page">
            <div className="container jap-content-wrapper" style={{ maxWidth: "680px" }}>

                {/* Top Section */}
                <div className="jap-top-section">
                    <header className="jap-header">
                        <div className="jap-brand-box">
                            <div className="jap-brand">॥ श्री राम ॥</div>
                            <div className="jap-subtitle">राम नाम जप</div>
                        </div>

                        <div className="jap-header-right">
                            <div className="jap-user-badge">
                                <div className="jap-user-name">{user.name}</div>
                                <div className="jap-sadhak-no">Sadhak #{user.sadhakNo}</div>
                            </div>

                            <Link href="/account" className="btn-header-account">
                                <span>👤</span> My Account
                            </Link>

                            <button onClick={handleLogout} className="btn-header-logout">
                                Logout
                            </button>
                        </div>
                    </header>

                    {/* Greeting */}
                    <div className="jap-greeting">
                        <h2>जय श्री राम, {user.name}</h2>
                        <p>मन को एकाग्र कर ध्यानपूर्वक राम नाम का जाप करें</p>
                    </div>

                    {/* Compact Count Display Card */}
                    <div className="jap-count-card">
                        <div className="jap-count-label">Jap Count</div>
                        <div className="jap-count">{unsavedJap.toLocaleString()}</div>
                    </div>
                </div>

                {/* Open Middle Stage for 3D Ram Animation */}
                <div className="jap-middle-stage">
                    <div className="jap-3d-portal" aria-hidden="true">
                        {particles.map((p) => (
                            <span
                                key={p.id}
                                className="ram-zoom-particle"
                                style={{
                                    "--drift-x": `${p.x}px`
                                }}
                                onAnimationEnd={() => removeParticle(p.id)}
                            >
                                {p.text}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Lower Chanting & Action Dock */}
                <div className="jap-lower-dock">
                    <div className="ram-button-box">
                        <button
                            onClick={handleJap}
                            className="ram-button-small"
                            aria-label="Chant Ram Naam"
                        >
                            <span>राम</span>
                        </button>
                    </div>

                    <div className="tap-hint">Tap to chant राम</div>

                    {/* Submit Jap Action */}
                    <div className="jap-submit-section">
                        <button
                            onClick={handleSubmitJap}
                            className="btn jap-submit-button"
                            disabled={unsavedJap === 0 || submitting}
                        >
                            {submitting ? "Submitting..." : `Submit Jap (${unsavedJap})`}
                        </button>
                    </div>

                    {/* Status Alert */}
                    {message && (
                        <div
                            className={`alert ${
                                message.includes("successfully")
                                    ? "alert-success"
                                    : "alert-info"
                            } text-center jap-message-alert`}
                            role="alert"
                        >
                            {message}
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}