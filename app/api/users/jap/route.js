import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized"
                },
                { status: 401 }
            );
        }

        const token = authHeader.split(" ")[1];

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Get request body
        const body = await request.json();

        const count = Number(body.count);

        // Validate count
        if (!Number.isInteger(count) || count <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid Jap count"
                },
                { status: 400 }
            );
        }

        // Connect to MongoDB
        await connectDB();

        // Add submitted Jap count to user's existing count
        const user = await User.findByIdAndUpdate(
            decoded.userId,
            {
                $inc: {
                    japCount: count
                }
            },
            {
                new: true
            }
        );

        // User not found
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 404 }
            );
        }

        // Success
        return NextResponse.json(
            {
                success: true,
                message: "Jap submitted successfully",
                japCount: user.japCount
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Submit Jap error:", error);

        // Invalid JWT
        if (error.name === "JsonWebTokenError") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid token"
                },
                { status: 401 }
            );
        }

        // Expired JWT
        if (error.name === "TokenExpiredError") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Token expired. Please login again."
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