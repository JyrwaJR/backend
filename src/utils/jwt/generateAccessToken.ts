import { env } from "@/env";
import { Prisma } from "@db-prisma/client";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(env.JWT_SECRET_KEY); // Convert to Uint8Array
const expiresIn = env.JWT_ACCESS_EXPIRES_IN;
export const generateAccessToken = async (
  user: Prisma.UserCreateInput,
): Promise<string> => {
  return await new SignJWT({ id: user.id }) // Payload
    .setProtectedHeader({ alg: "HS256" }) // Algorithm
    .setExpirationTime(expiresIn) // Expiry time
    .sign(secret); // Sign with secret
};
