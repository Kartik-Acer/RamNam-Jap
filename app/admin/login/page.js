"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Admin login failed"
                );
                return;
            }

            // Save admin token
            localStorage.setItem(
                "adminToken",
                data.token
            );

            localStorage.setItem(
                "admin",
                JSON.stringify(data.admin)
            );

            // Go to admin dashboard
            router.push("/admin/dashboard");

        } catch (error) {
            console.error(error);

            setMessage(
                "Something went wrong"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-md-5">

                    <div className="card shadow">

                        <div className="card-body p-4">

                            <h2 className="text-center mb-4">
                                Admin Login
                            </h2>

                            <form onSubmit={handleLogin}>

                                {/* Username */}
                                <div className="mb-3">

                                    <label className="form-label">
                                        Username
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter username"
                                        required
                                    />

                                </div>

                                {/* Password */}
                                <div className="mb-3">

                                    <label className="form-label">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter password"
                                        required
                                    />

                                </div>

                                {/* Error */}
                                {message && (
                                    <div className="alert alert-danger">
                                        {message}
                                    </div>
                                )}

                                {/* Login */}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Logging in..."
                                        : "Admin Login"
                                    }
                                </button>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}