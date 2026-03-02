import { z } from "zod";

// Auth Schemas
export const RegisterSchema = z.object({
  action: z.literal("register"),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[0-9]/, "Password must contain number")
    .regex(/[!@#$%^&*]/, "Password must contain special character"),
});

export const LoginSchema = z.object({
  action: z.literal("login"),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password required"),
});

export const AuthSchema = z.union([RegisterSchema, LoginSchema]);

// Task Schemas
export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title required").max(255),
  description: z.string().max(1000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  due_date: z.string().datetime().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export const TaskStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

// Types
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type AuthInput = z.infer<typeof AuthSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type TaskStatusInput = z.infer<typeof TaskStatusSchema>;

// Baseline Schemas (Intentionally weak validation)
export const BaselineRegisterSchema = z.object({
  action: z.literal("register"),
  email: z.string().min(1),
  password: z.string().min(1),
});

export const BaselineLoginSchema = z.object({
  action: z.literal("login"),
  email: z.string().min(1),
  password: z.string().min(1),
});

export const BaselineAuthSchema = z.union([
  BaselineRegisterSchema,
  BaselineLoginSchema,
]);

export const BaselineCreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.string().optional(),
  due_date: z.string().optional(),
});

export type BaselineCreateTaskInput = z.infer<typeof BaselineCreateTaskSchema>;
