import { cache } from "react";
import { auth } from "@/auth";
import { AppError } from "./errors";
import { prisma } from "./prisma";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
};

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;

  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("UNAUTHENTICATED", "Log in to continue");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new AppError("FORBIDDEN", "Only an administrator can do this");
  }
  return user;
}
