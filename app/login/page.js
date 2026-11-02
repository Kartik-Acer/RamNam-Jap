"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import "./login.css";

export default function LoginPage() {
  const router = useRouter();

  const [sadhakNo, setSadhakNo] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sadhakNo: sadhakNo.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/jap");
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="container">
        <div className="login-card">
          <div className="text-center login-heading">
            <div className="login-symbol">॥ श्री राम ॥</div>

            <h2>Sadhak Login</h2>

            <p className="login-description">
              Welcome back. Continue your Ram Naam Jap.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="sadhakNo" className="form-label">
                Sadhak Number
              </label>

              <input
                id="sadhakNo"
                type="text"
                className="form-control login-input"
                value={sadhakNo}
                onChange={(e) => setSadhakNo(e.target.value)}
                placeholder="Enter your Sadhak Number"
                inputMode="numeric"
                maxLength={4}
                pattern="[0-9]{4}"
                autoComplete="username"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>

              <input
                id="password"
                type="password"
                className="form-control login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            {message && (
              <div className="alert alert-danger login-alert" role="alert">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="btn login-primary-btn w-100"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="login-footer text-center">
            Don&apos;t have an account? <Link href="/register">Register here</Link>
          </div>

          <div className="login-home-link text-center">
            <Link href="/">Back to Home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
