import { prisma } from "@/lib/db";
import { getUserById } from "@/services/auth/getUserById";
import { updateUserRefreshTokenByUserId } from "@/services/auth/updateUserRefreshTokenByUserId";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
} from "@/utils/jwt";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const header = req.headers.get("Authorization");
    const accessToken = header?.split(" ")[1];
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const decoded = await verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: "Unauthorized h" }, { status: 401 });
    }
    const user = await getUserById({
      userId: decoded.id || "",
    });
    return NextResponse.json(
      { message: "Successfully fetch user", user },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Find user by email (Auth table includes hashed password)
    const auth = await prisma.auth.findUnique({
      where: { email },
      include: { user: true }, // Fetch user details as well
    });

    if (!auth || !auth.user) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, auth.password || "");
    if (!passwordMatch) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate Tokens
    const accessToken = await generateAccessToken(auth.user);
    const refreshToken = await generateRefreshToken(auth.user);
    await prisma.token.create({
      data: {
        token: refreshToken,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 7 * 60 * 60 * 1000),
        authId: auth.id,
      },
    });

    return Response.json(
      {
        message: "Login successful",
        token: accessToken,
        refresh: refreshToken,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Internal Server Error", error },
      { status: 500 },
    );
  }
}
