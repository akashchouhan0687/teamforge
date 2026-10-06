import { z } from "zod";

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(100)
    .trim(),
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const LoginSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .trim()
    .toLowerCase(),
  password: z.string().min(1, { message: "Password is required." }),
});

export type RegisterFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    general?: string[];
  };
  message?: string;
} | undefined;

export type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    general?: string[];
  };
  message?: string;
} | undefined;

export const ProfileSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(100, { message: "Name cannot exceed 100 characters." })
    .trim(),
  department: z
    .string()
    .min(2, { message: "Please select or enter your department." })
    .max(100, { message: "Department cannot exceed 100 characters." })
    .trim(),
  year: z
    .string()
    .min(1, { message: "Please select your academic year." })
    .max(50, { message: "Academic year cannot exceed 50 characters." })
    .trim(),
  bio: z
    .string()
    .max(500, { message: "Bio cannot exceed 500 characters." })
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(100, { message: "Location cannot exceed 100 characters." })
    .optional()
    .or(z.literal("")),
  profileImage: z
    .string()
    .max(500, { message: "Profile photo URL is too long." })
    .optional()
    .or(z.literal("")),
  interests: z
    .string()
    .max(300, { message: "Interests cannot exceed 300 characters." })
    .optional()
    .or(z.literal("")),
});

export type ProfileFormState = {
  errors?: {
    name?: string[];
    department?: string[];
    year?: string[];
    bio?: string[];
    location?: string[];
    profileImage?: string[];
    interests?: string[];
    general?: string[];
  };
  message?: string;
  success?: boolean;
} | undefined;

const urlOrEmpty = (message: string) =>
  z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        try {
          const parsed = new URL(val);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message }
    )
    .optional()
    .or(z.literal(""));

export const ProjectSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Project title must be at least 2 characters." })
    .max(150, { message: "Project title cannot exceed 150 characters." })
    .trim(),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." })
    .max(2000, { message: "Description cannot exceed 2000 characters." })
    .trim(),
  role: z
    .string()
    .max(100, { message: "Role cannot exceed 100 characters." })
    .optional()
    .or(z.literal("")),
  technologies: z
    .string()
    .max(300, { message: "Technologies cannot exceed 300 characters." })
    .optional()
    .or(z.literal("")),
  githubUrl: urlOrEmpty("Please enter a valid URL (starting with http:// or https://)"),
  liveUrl: urlOrEmpty("Please enter a valid URL (starting with http:// or https://)"),
  imageUrl: urlOrEmpty("Please enter a valid image URL (starting with http:// or https://)"),
  projectType: z.string().optional().or(z.literal("")),
  teamSize: z.coerce.number().int().positive().optional().or(z.literal(0)).or(z.literal("")),
  requiredSkills: z.string().optional().or(z.literal("")), // JSON serialized string
  preferredSkills: z.string().optional().or(z.literal("")), // JSON serialized string
});

export type ProjectFormState = {
  errors?: {
    title?: string[];
    description?: string[];
    role?: string[];
    technologies?: string[];
    githubUrl?: string[];
    liveUrl?: string[];
    imageUrl?: string[];
    projectType?: string[];
    teamSize?: string[];
    requiredSkills?: string[];
    preferredSkills?: string[];
    general?: string[];
  };
  message?: string;
  success?: boolean;
  projectId?: string;
} | undefined;


