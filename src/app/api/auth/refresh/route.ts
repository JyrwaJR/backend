import { prisma } from "@/lib/db";
import { errorHandler } from "@/utils/errorHandler";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt";
import { NextResponse } from "next/server";

// Get refresh token renewal threshold from environment variables
const JWT_BEFORE_REFRESH_EXPIRES_IN =
  parseInt(process.env.JWT_BEFORE_REFRESH_EXPIRES_IN || "3600") * 1000; // Convert to ms
const JWT_REFRESH_EXPIRES_IN =
  parseInt(process.env.JWT_REFRESH_EXPIRES_IN || "7200") * 1000; // Convert to ms

export async function POST(request: Request) {
  try {
    const header = request.headers.get("Authorization");
    const refreshToken = header?.split(" ")[1];

    if (!refreshToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch the refresh token entry in the database
    const tokenEntry = await prisma.token.findFirst({
      where: {
        token: refreshToken,
        expiresAt: { gt: new Date() }, // Ensure it's still valid
        revokedAt: null, // Ensure it's not revoked
      },
      include: {
        auth: {
          include: { user: true },
        },
      },
    });

    if (!tokenEntry || !tokenEntry.auth || !tokenEntry.auth.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Generate new access token
    const accessToken = await generateAccessToken(tokenEntry.auth.user);

    // Check if the refresh token is **near expiration** (based on the `.env` setting)
    const timeUntilExpiry = tokenEntry.expiresAt.getTime() - Date.now();
    const isTokenNearExpiry = timeUntilExpiry <= JWT_BEFORE_REFRESH_EXPIRES_IN;

    if (isTokenNearExpiry) {
      // Revoke old token and issue a new refresh token
      const newRefreshToken = await generateRefreshToken(tokenEntry.auth.user);

      await prisma.$transaction([
        // Revoke old refresh token
        prisma.token.update({
          where: { token: refreshToken },
          data: { revokedAt: new Date() },
        }),
        // Create a new refresh token
        prisma.token.create({
          data: {
            token: newRefreshToken,
            revokedAt: null,
            expiresAt: new Date(Date.now() + JWT_REFRESH_EXPIRES_IN),
            authId: tokenEntry.auth.id,
          },
        }),
      ]);

      return NextResponse.json(
        {
          message: "Token refreshed",
          accessToken,
          refreshToken: newRefreshToken,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { message: "Token refreshed", accessToken },
      { status: 200 },
    );
  } catch (error) {
    return errorHandler(error);
  }
}
