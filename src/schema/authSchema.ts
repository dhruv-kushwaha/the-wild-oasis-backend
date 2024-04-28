import z from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(16),
});

const rawSignupSchema = loginSchema.extend({
  name: z.string().trim().min(3),
  confirmPassword: z.string().min(8).max(16),
  avatar: z.string().optional(),
});

const passwordRefineFunction = (schema: any) =>
  schema.password === schema.confirmPassword;

const passwordRefineOptions = {
  message: "Password do not match",
  path: ["confirmPassword"],
};

export const signupSchema = rawSignupSchema.refine(
  passwordRefineFunction,
  passwordRefineOptions
);

export const updateUserSchema = z.object({
  name: z.string().optional(),
  avatar: z.instanceof(File).optional(),
});

export const updatePasswordSchema = rawSignupSchema
  .pick({
    password: true,
    confirmPassword: true,
  })
  .refine(passwordRefineFunction, passwordRefineOptions);

export type IloginType = z.infer<typeof loginSchema>;
export type ISignupType = z.infer<typeof signupSchema>;
/*
const userSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .trim(),

  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email({ message: "Invalid email address" })
    .min(5, { message: "Must be 5 or more characters long" })
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, { message: "Must be 8 or more characters long" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>\/?]).{8,}$/,
      { message: "password validation failed" }
    )
    .trim(),
});
*/
