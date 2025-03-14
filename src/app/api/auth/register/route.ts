import { env } from "@/env";
import { prisma } from "@/lib/db";
import { errorHandler } from "@/utils/errorHandler";
import { registerSchema } from "@/utils/validation/auth/registerSchema";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    registerSchema.parse({ name, email, password });
    // Check if user already exists
    const existingUser = await prisma.auth.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user & auth record inside a transaction
    const newUser = await prisma.user.create({
      data: {
        name,
        auth: {
          create: {
            email,
            password: hashedPassword,
          },
        },
      },
      include: { auth: true }, // Include auth details for debugging
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.auth?.email, // Include email but not password
          role: newUser.role,
          isVerified: newUser.isVerified,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return errorHandler(error);
  }
}
