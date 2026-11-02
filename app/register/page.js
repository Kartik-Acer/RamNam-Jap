"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import "./register.css";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [sadhakNo, setSadhakNo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      setSadhakNo(data.sadhakNo);
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sadhakNo) {
    return (
      <main className="register-page">
        <div className="container">
          <div className="register-card text-center">
            <div className="register-symbol">॥ श्री राम ॥</div>

            <div className="register-success-icon">✓</div>

            <h2>Registration Successful!</h2>

            <p className="register-description">
              Welcome to the Ram Naam Jap community.
            </p>

            <div className="sadhak-number-box">
              <p>Your Sadhak Number</p>
              <h1>{sadhakNo}</h1>
              <small>Save this number for future login.</small>
            </div>

            <button
              className="btn register-primary-btn w-100 mt-4"
              onClick={() => router.push("/login")}
            >
              Continue to Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="register-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="register-card">
              <div className="text-center mb-4">
                <div className="register-symbol">॥ श्री राम ॥</div>

                <h2>Create Your Account</h2>

                <p className="register-description">
                  Begin your journey of Ram Naam Jap.
                </p>
              </div>

              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>

                  <input
                    type="text"
                    className="form-control register-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>

                  <input
                    type="password"
                    className="form-control register-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    minLength={4}
                    required
                  />

                  <small className="text-muted">
                    Use at least 4 characters.
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>

                  <input
                    type="password"
                    className="form-control register-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter password again"
                    required
                  />
                </div>

                {message && <div className="alert alert-danger">{message}</div>}

                <button
                  type="submit"
                  className="btn register-primary-btn w-100"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <div className="register-footer text-center">
                Already registered? <Link href="/login">Login here</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
