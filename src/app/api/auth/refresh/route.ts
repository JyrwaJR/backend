import { prisma } from "@/lib/db";
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
    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 401 },
      );
    }

    // Fetch the refresh token entry in the database
    const tokenEntry = await prisma.token.findFirst({
      where: {
        token: refreshToken,
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
    const newAccessToken = await generateAccessToken(tokenEntry?.auth?.user);

    return NextResponse.json(
      { message: "Token refreshed", token: newAccessToken },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 },
    );
  }
}
