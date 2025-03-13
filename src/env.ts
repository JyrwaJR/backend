import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    JWT_SECRET_KEY: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_API_BASE_URL: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  // experimental__runtimeEnv: {
  //   NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  // },
});
