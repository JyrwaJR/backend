import { env } from "@/env";
import { jwtVerify, JWTPayload } from "jose";

const secret = new TextEncoder().encode(env.JWT_SECRET_KEY); // Convert to Uint8Array

interface Decoded extends JWTPayload {
  id?: string;
}

export const verifyAccessToken = async (token: string): Promise<Decoded> => {
  try {
    const { payload } = await jwtVerify(token, secret); // Verify token
    return payload; // Return decoded payload
  } catch (error) {
    throw error;
  }
};
