import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
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

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Both current password and new password are required."
                },
                { status: 400 }
            );
        }

        if (newPassword.length < 4) {
            return NextResponse.json(
                {
                    success: false,
                    message: "New password must be at least 4 characters long."
                },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findById(decoded.userId);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found."
                },
                { status: 404 }
            );
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Current password is incorrect."
                },
                { status: 400 }
            );
        }

        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return NextResponse.json(
                {
                    success: false,
                    message: "New password must be different from current password."
                },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: "Password changed successfully."
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Change password error:", error);

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
                message: "Something went wrong while updating your password."
            },
            { status: 500 }
        );
    }
}
