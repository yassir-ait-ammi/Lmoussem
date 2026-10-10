import bcrypt from "bcryptjs";
import { AppError } from "./errors";
import { prisma } from "./prisma";
import type { SignUpInput } from "./validation";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
};

export async function createUser(input: SignUpInput): Promise<PublicUser> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existing) {
    const message = "An account already exists with this email";
    throw new AppError("EMAIL_TAKEN", message, { email: message });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
    select: { id: true, name: true, email: true, role: true },
  });
}
