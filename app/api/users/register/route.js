import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

function generateSadhakNo() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();

        const { name, password } = body;

        // Basic validation
        if (!name || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Name and password are required"
                },
                { status: 400 }
            );
        }

        if (password.length < 4) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Password must be at least 4 characters"
                },
                { status: 400 }
            );
        }

        // Generate unique Sadhak No.
        let sadhakNo;
        let existingUser;

        do {
            sadhakNo = generateSadhakNo();

            existingUser = await User.findOne({
                sadhakNo: sadhakNo
            });

        } while (existingUser);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name: name,
            sadhakNo: sadhakNo,
            password: hashedPassword
        });

        return NextResponse.json(
            {
                success: true,
                message: "Registration successful",
                sadhakNo: user.sadhakNo
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Registration error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong"
            },
            { status: 500 }
        );
    }
}