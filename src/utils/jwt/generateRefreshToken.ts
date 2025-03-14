import { env } from "@/env";
import { Prisma } from "@db-prisma/client";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(env.JWT_REFRESH_SECRET); // Convert to Uint8Array

export const generateRefreshToken = async (
  user: Prisma.UserCreateInput,
): Promise<string> => {
  return await new SignJWT({ id: user.id }) // Payload
    .setProtectedHeader({ alg: "HS256" }) // Algorithm
    .sign(secret); // Sign with secret
};
