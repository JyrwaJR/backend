import { prisma } from "@/lib/db";
import { errorHandler } from "@/utils/errorHandler";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(
      { message: "Successfully fetch user", users },
      { status: 200 },
    );
  } catch (error) {
    return errorHandler(error);
  }
}
