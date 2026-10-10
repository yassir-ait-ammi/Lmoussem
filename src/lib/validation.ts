import { z } from "zod";

export const eventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be at most 120 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be at most 2000 characters"),
  date: z
    .string({ error: "Enter a valid date and time" })
    .min(1, "Enter a valid date and time")
    .pipe(z.coerce.date({ error: "Enter a valid date and time" })),
  place: z
    .string()
    .trim()
    .min(2, "Place must be at least 2 characters")
    .max(120, "Place must be at most 120 characters"),
  capacity: z.coerce
    .number({ error: "Capacity must be a number" })
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .max(100000, "Capacity must be at most 100000"),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Enter your password"),
});

const optionalText = z
  .string()
  .trim()
  .max(120)
  .optional()
  .transform((value) => (value ? value : undefined));

const optionalDay = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);

export const eventFiltersSchema = z.object({
  q: optionalText,
  place: optionalText,
  from: optionalDay,
  to: optionalDay,
  available: z
    .string()
    .optional()
    .transform((value) => value === "1" || value === "true"),
});

export type EventInput = z.infer<typeof eventSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type EventFilters = z.infer<typeof eventFiltersSchema>;

export function fieldErrors(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}
