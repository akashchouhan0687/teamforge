"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import {
  RegisterSchema,
  LoginSchema,
  RegisterFormState,
  LoginFormState,
} from "@/lib/definitions";

export async function register(
  state: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  // 1. Validate fields
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  // 2. Check if user already exists
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return {
      errors: {
        email: ["An account with this email already exists."],
      },
    };
  }

  // 3. Hash password and create user
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      profile: {
        create: {}, // create empty profile automatically
      },
    },
  });

  // 4. Create session
  await createSession(user.id);

  // 5. Redirect to dashboard
  redirect("/dashboard");
}

export async function login(
  state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  // 1. Validate fields
  const validatedFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  // 2. Look up user
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return {
      errors: {
        general: ["Invalid email or password."],
      },
    };
  }

  // 3. Verify password
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return {
      errors: {
        general: ["Invalid email or password."],
      },
    };
  }

  // 4. Create session
  await createSession(user.id);

  // 5. Redirect to dashboard
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
