import { object, string, z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "Fullname is required"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(/[a-zA-Z]/, {
        message: "Password must contain at least one letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[@$!%*?&#]/, {
        message:
          "Password must contain at least one special character (@$!%*?&#)",
      }),
    isVerified: z.boolean().optional(),
  }),
});

// verify otp
export const verifyOtpSchema = object({
  body: object({
    otp: string()
      .nonempty("OTP is required")
      .length(6, "OTP must be 6 digits")
      .regex(/^\d+$/, "OTP must contain only numbers"),

    email: string().nonempty("Email is required").email("Invalid email format"),
  }),
});

// resend otp verification
export const resendOtpVerificationSchema = object({
  body: object({
    email: string().nonempty("Email is required").email("Invalid email format"),
  }),
});

//login
export const loginSchema = object({
  body: object({
    email: string().min(1, "Email is required").email("Invalid email format"),
    password: string().min(1, "Password is required"),
  }),
});

// forgot password
export const forgotPasswordSchema = object({
  body: object({
    email: string().min(1, "Email is required").email("Invalid email format"),
  }),
});

//reset password
export const resetPasswordSchema = object({
  params: object({
    token: string()
      .min(1, { message: "Token cannot be empty" }),
  }),
  body: object({
    newPassword: string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[a-zA-Z]/, {
        message: "Password must contain at least one letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[@$!%*?&#]/, {
        message:
          "Password must contain at least one special character (@$!%*?&#)",
      }),
  }),
});


export type CreateUserInput = z.infer<typeof createUserSchema>["body"];
