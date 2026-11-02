import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();

        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username and password are required"
                },
                { status: 400 }
            );
        }

        const admin = await Admin.findOne({
            username: username
        });

        if (!admin) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid username or password"
                },
                { status: 401 }
            );
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isPasswordCorrect) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid username or password"
                },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            {
                adminId: admin._id.toString(),
                username: admin.username,
                role: "admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return NextResponse.json(
            {
                success: true,
                message: "Admin login successful",
                token: token,
                admin: {
                    id: admin._id,
                    username: admin.username
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Admin login error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong"
            },
            { status: 500 }
        );
    }
}