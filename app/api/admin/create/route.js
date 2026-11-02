import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

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

        const existingAdmin = await Admin.findOne({
            username: username
        });

        if (existingAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Admin already exists"
                },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const admin = await Admin.create({
            username: username,
            password: hashedPassword
        });

        return NextResponse.json(
            {
                success: true,
                message: "Admin created successfully",
                admin: {
                    id: admin._id,
                    username: admin.username
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Create admin error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong"
            },
            { status: 500 }
        );
    }
}