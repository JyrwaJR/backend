import { z } from "zod";
import { loginSchema } from "./loginSchema";

export const registerSchema = loginSchema.extend({
  name: z.string().min(3),
});
