import { v4 as uuid } from "uuid";
import { prisma } from "../config/prisma.js";
import { AppError } from "../lib/api-error.js";
import type { AuthProvider } from "@prisma/client";

/** Resolve a Supabase user ID to the local users.id. Throws 401 if not found. */
export async function resolveLocalUserId(supabaseId: string): Promise<string> {
  const identity = await prisma.authIdentity.findFirst({
    where: { providerUserId: supabaseId },
    select: { userId: true },
  });
  if (!identity) throw AppError.unauthorized("User not found. Call /auth/me first.");
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
    await prisma.authIdentity.update({
      where: { id: existing.id },
      data: { lastLoginAt: new Date() },
    });
    return existing.user;
  }

  // Same provider + email but different/missing provider_user_id (e.g. partial
  // writes or Supabase user id change). Link this identity instead of inserting.
  if (normalizedEmail) {
    const byEmail = await prisma.authIdentity.findUnique({
      where: { provider_email: { provider, email: normalizedEmail } },
      include: { user: true },
    });
    if (byEmail) {
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

  if (!user) return null;

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
