import { v4 as uuid } from "uuid";
import { prisma } from "../config/prisma.js";
import { AppError } from "../lib/api-error.js";
import type { AuthProvider } from "@prisma/client";

function ensureNotDeleted(status: string) {
  if (status === "deleted") {
    throw AppError.forbidden("This account has been deleted");
  }
}

export async function resolveLocalUserId(supabaseId: string): Promise<string> {
  const identity = await prisma.authIdentity.findFirst({
    where: { providerUserId: supabaseId },
    select: {
      userId: true,
      user: { select: { status: true } },
    },
  });
  if (!identity) throw AppError.unauthorized("User not found. Call /auth/me first.");
  ensureNotDeleted(identity.user.status);
  return identity.userId;
}

export async function getOrCreateUser(
  supabaseId: string,
  email: string,
  provider: AuthProvider = "google",
) {
  const normalizedEmail = email.trim().toLowerCase() || null;

  const existing = await prisma.authIdentity.findUnique({
    where: { provider_providerUserId: { provider, providerUserId: supabaseId } },
    include: { user: true },
  });

  if (existing) {
    ensureNotDeleted(existing.user.status);
    await prisma.authIdentity.update({
      where: { id: existing.id },
      data: { lastLoginAt: new Date() },
    });
    return existing.user;
  }

  if (normalizedEmail) {
    const byEmail = await prisma.authIdentity.findUnique({
      where: { provider_email: { provider, email: normalizedEmail } },
      include: { user: true },
    });
    if (byEmail) {
      ensureNotDeleted(byEmail.user.status);
      await prisma.authIdentity.update({
        where: { id: byEmail.id },
        data: {
          providerUserId: supabaseId,
          lastLoginAt: new Date(),
          emailVerifiedAt: byEmail.emailVerifiedAt ?? new Date(),
        },
      });
      return byEmail.user;
    }
  }

  const userId = uuid();
  const identityId = uuid();

  const user = await prisma.user.create({
    data: {
      id: userId,
      authIdentities: {
        create: {
          id: identityId,
          provider,
          providerUserId: supabaseId,
          email: normalizedEmail,
          emailVerifiedAt: new Date(),
          lastLoginAt: new Date(),
        },
      },
    },
  });

  return user;
}

export async function deleteAccount(userId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.post.updateMany({
      where: { authorUserId: userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    await tx.user.update({
      where: { id: userId },
      data: { status: "deleted", deletedAt: new Date() },
    });
  });
}

export async function getAuthContext(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: {
          avatarMedia: { select: { publicUrl: true } },
        },
      },
    },
  });

  if (!user || user.status === "deleted") return null;

  const profile = user.profile
    ? {
        id: user.profile.id,
        username: user.profile.username,
        display_name: user.profile.displayName,
        bio: user.profile.bio,
        avatar_url: user.profile.avatarMedia?.publicUrl ?? null,
      }
    : null;

  const isComplete = profile !== null;
  const missingFields: string[] = [];
  if (!profile) {
    missingFields.push("username", "display_name");
  }

  return {
    user: { id: user.id, status: user.status },
    profile,
    onboarding: { is_complete: isComplete, missing_fields: missingFields },
  };
}
