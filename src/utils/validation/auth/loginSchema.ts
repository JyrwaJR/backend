import { z } from "zod";
import { passwordValidiation } from "../common";
export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email({
      message: "Invalid email",
    }),
  password: passwordValidiation,
});
