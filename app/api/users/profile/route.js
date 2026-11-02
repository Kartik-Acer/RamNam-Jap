import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized access"
                },
                { status: 401 }
            );
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        await connectDB();

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    sadhakNo: user.sadhakNo,
                    japCount: user.japCount || 0,
                    createdAt: user.createdAt
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Profile API error:", error);

        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired session. Please log in again."
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Unable to retrieve profile details"
            },
            { status: 500 }
        );
    }
}
