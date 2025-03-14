import { prisma } from "@/lib/db";
import { getUserById } from "@/services/auth/getUserById";
import { errorHandler } from "@/utils/errorHandler";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
} from "@/utils/jwt";
import { loginSchema } from "@/utils/validation/auth/loginSchema";
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
    return errorHandler(error);
  }
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    loginSchema.parse({ email, password });
    // Find user by email (Auth table includes hashed password)
    const auth = await prisma.auth.findUnique({
      where: { email },
      include: { user: true }, // Fetch user details as well
    });

    if (!auth || !auth.user) {
      return Response.json({ error: "User not found" }, { status: 401 });
    }

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, auth.password || "");
    if (!passwordMatch) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate Tokens
    const accessToken = await generateAccessToken(auth.user);
    const refreshToken = await generateRefreshToken(auth.user);
    const token = await prisma.token.findFirst({
      where: { authId: auth.id, expiresAt: new Date(), revokedAt: null },
    });
    if (token) {
      await prisma.token.update({
        where: { id: token.id, expiresAt: new Date(), revokedAt: null },
        data: {
          token: refreshToken,
          revokedAt: null,
          expiresAt: new Date(Date.now() + 7 * 60 * 60 * 1000),
          authId: auth.id,
        },
      });
    }
    await prisma.token.create({
      data: {
        token: refreshToken,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 7 * 60 * 60 * 1000),
        authId: auth.id,
      },
    });
    return NextResponse.json(
      {
        message: "Login successful",
        token: accessToken,
        refresh: refreshToken,
      },
      { status: 200 },
    );
  } catch (error) {
    return errorHandler(error);
  }
}
