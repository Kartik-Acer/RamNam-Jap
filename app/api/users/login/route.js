import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();

        const { sadhakNo, password } = body;

        // Validation
        if (!sadhakNo || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Sadhak No. and password are required"
                },
                { status: 400 }
            );
        }

        // Find user
        const user = await User.findOne({
            sadhakNo: sadhakNo
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid Sadhak No. or password"
                },
                { status: 401 }
            );
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid Sadhak No. or password"
                },
                { status: 401 }
            );
        }

        // Create JWT
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                sadhakNo: user.sadhakNo
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return NextResponse.json(
            {
                success: true,
                message: "Login successful",
                token: token,
                user: {
                    id: user._id,
                    name: user.name,
                    sadhakNo: user.sadhakNo,
                    japCount: user.japCount
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Login error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong"
            },
            { status: 500 }
        );
    }
}