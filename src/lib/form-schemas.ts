import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["student", "teacher"]),
  title: z.enum(["Mr", "Mrs"]).optional(),
  sex: z.enum(["male", "female"]).optional(),
  age: z.number().min(1).max(150).optional(),
  city: z.string().max(255).optional(),
});

export type RegisterForm = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.enum(["Mr", "Mrs"]).nullable().optional(),
  sex: z.enum(["male", "female"]).nullable().optional(),
  age: z.number().min(1).max(150).nullable().optional(),
  city: z.string().max(255).optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

export type ProfileForm = z.infer<typeof profileSchema>;

export const registerCenterSchema = z.object({
  name: z.string().min(1, "Center name is required").max(255),
  description: z.string().optional(),
  slug: z.string().min(1, "URL slug is required").max(255).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
});

export type RegisterCenterForm = z.infer<typeof registerCenterSchema>;

export const createLessonSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  videoUrl: z.string().min(1, "Video URL is required").max(512).url("Enter a valid URL"),
  level: z.enum(["a1", "a2", "b1", "b2", "c1", "c2"]).optional(),
});

export type CreateLessonForm = z.infer<typeof createLessonSchema>;

export const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  options: z.array(z.string()).min(2, "At least 2 options are required"),
  correctAnswerIndex: z.number().min(0, "Select the correct answer"),
});

export type QuestionForm = z.infer<typeof questionSchema>;

export const redeemInviteSchema = z.object({
  code: z.string().min(4, "Code must be at least 4 characters").max(32),
});

export type RedeemInviteForm = z.infer<typeof redeemInviteSchema>;

const emailEntry = z.object({ email: z.string().email("Invalid email") });
const locationEntry = z.object({
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
});
const phoneEntry = z.object({
  countryCode: z.string().min(1, "Country code is required"),
  number: z.string().min(1, "Phone number is required").max(50),
});

export const centerRequestSchema = z.object({
  centerName: z.string().min(1, "Center name is required").max(255),
  centerBio: z.string().optional(),
  logo: z.string().optional().nullable(),
  slug: z.string().min(1, "URL slug is required").max(255).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  emails: z.array(emailEntry).min(1, "At least one email is required"),
  locations: z.array(locationEntry).min(1, "At least one location is required"),
  phones: z.array(phoneEntry).min(1, "At least one phone number is required"),
  albumImages: z.array(z.string()).optional(),
  documents: z.array(z.object({ url: z.string(), type: z.string().optional() })).optional(),
  acceptedTerms: z.boolean().refine((v) => v === true, { message: "You must accept the Terms of Service" }),
  acceptedPrivacy: z.boolean().refine((v) => v === true, { message: "You must accept the Privacy Policy" }),
});

export type CenterRequestForm = z.infer<typeof centerRequestSchema>;

export const adminProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

export type AdminProfileForm = z.infer<typeof adminProfileSchema>;
