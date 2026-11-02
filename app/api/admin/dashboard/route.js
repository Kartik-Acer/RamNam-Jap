import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request) {
    try {
        // Get admin token
        const authHeader =
            request.headers.get("authorization");

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized"
                },
                { status: 401 }
            );
        }

        const token =
            authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Make sure this is an admin token
        if (decoded.role !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Admin access required"
                },
                { status: 403 }
            );
        }

        await connectDB();

        // Get all users
        const users = await User.find({})
            .select(
                "name sadhakNo japCount createdAt"
            )
            .sort({
                createdAt: -1
            });

        // Total users
        const totalUsers = users.length;

        // Total Jap
        const totalJap = users.reduce(
            (total, user) =>
                total + (user.japCount || 0),
            0
        );

        return NextResponse.json(
            {
                success: true,

                statistics: {
                    totalUsers,
                    totalJap
                },

                users
            },
            { status: 200 }
        );

    } catch (error) {
        console.error(
            "Admin dashboard error:",
            error
        );

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired token"
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong"
            },
            { status: 500 }
        );
    }
}