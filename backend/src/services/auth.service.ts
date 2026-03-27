import { prisma } from "../config/prisma.js";
import { AppError } from "../lib/api-error.js";

export async function ensureAppUser(supabaseUserId: string) {
  return prisma.user.upsert({
    where: { id: supabaseUserId },
    create: { id: supabaseUserId },
    update: {},
    select: { id: true, status: true },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      status: true,
      profile: {
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          avatarMedia: { select: { publicUrl: true } },
        },
      },
    },
  });

  if (!user) {
    throw AppError.notFound("User");
  }

  const profile = user.profile
    ? {
        id: user.profile.id,
        username: user.profile.username,
        display_name: user.profile.displayName,
        bio: user.profile.bio,
        avatar_url: user.profile.avatarMedia?.publicUrl ?? null,
      }
    : null;

  const isOnboardingComplete = !!user.profile;
  const missingFields: string[] = [];
  if (!user.profile) {
    missingFields.push("username", "display_name");
  }

  return {
    user: { id: user.id, status: user.status },
    profile,
    onboarding: {
      is_complete: isOnboardingComplete,
      missing_fields: missingFields,
    },
  };
}
