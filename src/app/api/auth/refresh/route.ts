import { prisma } from "@/lib/db";
import { errorHandler } from "@/utils/errorHandler";
import { generateAccessToken, verifyRefreshToken } from "@/utils/jwt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const header = request.headers.get("Authorization");
    const refreshToken = header?.split(" ")[1];

    if (!refreshToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify the refresh token
    // const decoded = await verifyRefreshToken(refreshToken);
    // if (!decoded) {
    //   return NextResponse.json(
    //     { message: "Invalid refresh token" },
    //     { status: 401 },
    //   );
    // }

    // Fetch the refresh token entry in the database
    const tokenEntry = await prisma.token.findFirst({
      where: {
        token: refreshToken,
        expiresAt: { gt: new Date() },
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
    const accessToken = await generateAccessToken(tokenEntry?.auth?.user);
    return NextResponse.json(
      { message: "Token refreshed", accessToken },
      { status: 200 },
    );
  } catch (error) {
    return errorHandler(error);
  }
}
