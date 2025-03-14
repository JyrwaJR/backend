import { getUserById } from "@/services/auth/getUserById";
import { updateUserRefreshTokenByUserId } from "@/services/auth/updateUserRefreshTokenByUserId";
import { errorHandler } from "@/utils/errorHandler";
import { verifyRefreshToken } from "@/utils/jwt";
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
    return errorHandler(error);
  }
}
