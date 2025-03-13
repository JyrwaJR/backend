import { env } from "@/env";
import { JWTPayload, jwtVerify } from "jose";

const secret = new TextEncoder().encode(env.JWT_REFRESH_SECRET); // Convert secret to Uint8Array

interface Decoded extends JWTPayload {
  id?: string;
}
export const verifyRefreshToken = async (token: string): Promise<Decoded> => {
  try {
    const { payload } = await jwtVerify(token, secret); // Verify token
    return payload; // Return decoded payload
  } catch (error) {
    throw error;
  }
};
