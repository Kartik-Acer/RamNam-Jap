"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
    const router = useRouter();

    const [statistics, setStatistics] = useState({
        totalUsers: 0,
        totalJap: 0
    });

    const [users, setUsers] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const loadDashboard = useCallback(async (token) => {
        try {
            const response = await fetch(
                "/api/admin/dashboard",
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("adminToken");
                    localStorage.removeItem("admin");

                    router.push("/admin/login");
                    return;
                }

                setMessage(
                    data.message ||
                    "Unable to load dashboard"
                );

                return;
            }

            startTransition(() => {
                setStatistics(data.statistics);
                setUsers(data.users);
            });

        } catch (error) {
            console.error(
                "Dashboard error:",
                error
            );

            setMessage(
                "Unable to connect to server"
            );

        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");

        if (!token) {
            router.push("/admin/login");
            return;
        }

        startTransition(() => {
            loadDashboard(token);
        });
    }, [router, loadDashboard]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");

        router.push("/admin/login");
    };

    const filteredUsers = users.filter((user) => {
        const searchText =
            search.toLowerCase().trim();

        if (!searchText) {
            return true;
        }

        return (
            user.name
                .toLowerCase()
                .includes(searchText) ||

            user.sadhakNo
                .toLowerCase()
                .includes(searchText)
        );
    });

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <h4>Loading dashboard...</h4>
            </div>
        );
    }

    return (
        <div className="container py-4">

            {/* Header */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="mb-1">
                        Admin Dashboard
                    </h2>

                    <small className="text-muted">
                        Ram Naam Jap
                    </small>
                </div>

                <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger"
                >
                    Logout
                </button>

            </div>


            {/* Error message */}

            {message && (
                <div className="alert alert-danger">
                    {message}
                </div>
            )}


            {/* Statistics */}

            <div className="row g-3 mb-4">

                <div className="col-md-6">

                    <div className="card shadow-sm">

                        <div className="card-body text-center">

                            <h6 className="text-muted">
                                Total Sadhaks
                            </h6>

                            <h1 className="fw-bold">
                                {statistics.totalUsers}
                            </h1>

                        </div>

                    </div>

                </div>


                <div className="col-md-6">

                    <div className="card shadow-sm">

                        <div className="card-body text-center">

                            <h6 className="text-muted">
                                Total Jap
                            </h6>

                            <h1 className="fw-bold">
                                {statistics.totalJap}
                            </h1>

                        </div>

                    </div>

                </div>

            </div>


            {/* Users */}

            <div className="card shadow-sm">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h4 className="mb-0">
                            Sadhaks
                        </h4>

                        <div style={{ maxWidth: "300px" }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search name / Sadhak No."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                    </div>


                    <div className="table-responsive">

                        <table className="table table-bordered table-hover">

                            <thead className="table-light">

                                <tr>
                                    <th>
                                        Sadhak No.
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Jap Count
                                    </th>

                                    <th>
                                        Registered
                                    </th>
                                </tr>

                            </thead>


                            <tbody>

                                {filteredUsers.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="text-center"
                                        >
                                            No sadhaks found
                                        </td>
                                    </tr>

                                ) : (

                                    filteredUsers.map((user) => (

                                        <tr key={user._id}>

                                            <td>
                                                {user.sadhakNo}
                                            </td>

                                            <td>
                                                {user.name}
                                            </td>

                                            <td>
                                                {user.japCount}
                                            </td>

                                            <td>
                                                {new Date(
                                                    user.createdAt
                                                ).toLocaleDateString()}
                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    );
}