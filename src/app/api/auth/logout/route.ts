import { getUserById } from "@/services/auth/getUserById";
import { updateUserRefreshTokenByUserId } from "@/services/auth/updateUserRefreshTokenByUserId";
import { verifyRefreshToken } from "@/utils/jwt";
import { JWTExpired } from "jose/errors";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const header = request.headers.get("Authorization");
    const refreshToken = header?.split(" ")[1];
    if (refreshToken) {
      const decoded = await verifyRefreshToken(refreshToken);
      if (decoded?.id) {
        const user = await getUserById({ userId: decoded.id });
        if (user?.auth?.id) {
          await updateUserRefreshTokenByUserId({
            refreshToken: refreshToken,
            userId: user?.auth?.id,
            revoked: true,
          });
          return NextResponse.json({ message: "Logged out successfully" });
        }
        return NextResponse.json(
          { message: "Authorization not found" },
          { status: 401 },
        );
      }
      return NextResponse.json({ message: "id not found" }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Something went wrong, Please try again" },
      { status: 500 },
    );
  } catch (error) {
    if (error instanceof JWTExpired) {
      return NextResponse.json(
        { message: "Please login again", error },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 },
    );
  }
}
