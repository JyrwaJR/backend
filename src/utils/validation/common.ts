import { z } from "zod";
import {
  oneLowercaseRegex,
  oneNumberRegex,
  oneSpecialRegex,
  oneUppercaseRegex,
} from "../regex";

export const passwordValidiation = z
  .string()
  .min(8)
  .regex(oneNumberRegex, {
    message: "Password must contain at least one number",
  })
  .regex(oneLowercaseRegex, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(oneUppercaseRegex, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(oneSpecialRegex, {
    message: "Password must contain at least one special character",
  });
