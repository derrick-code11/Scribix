import { v4 as uuid } from "uuid";
import { prisma } from "../config/prisma.js";
import { AppError } from "../lib/api-error.js";

const USERNAME_RE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

export async function getPublicProfile(username: string) {
  const profile = await prisma.profile.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      avatarMedia: { select: { publicUrl: true } },
      links: { orderBy: { position: "asc" } },
    },
  });

  if (!profile) {
    throw AppError.notFound("Profile");
  }

  return {
    ...formatProfile(profile),
    links: profile.links.map(formatLink),
  };
}

export async function checkUsernameAvailability(username: string) {
  const normalized = username.toLowerCase().trim();

  if (!USERNAME_RE.test(normalized)) {
    return {
      username: normalized,
      available: false,
      reason: "invalid" as const,
    };
  }

  const existing = await prisma.profile.findUnique({
    where: { username: normalized },
    select: { id: true },
  });

  return {
    username: normalized,
    available: !existing,
    reason: existing ? ("taken" as const) : null,
  };
}

export async function upsertProfile(
  userId: string,
  data: {
    username?: string;
    display_name: string;
    bio?: string | null;
    avatar_media_id?: string | null;
  },
) {
  const existing = await prisma.profile.findUnique({
    where: { userId },
    include: { avatarMedia: { select: { publicUrl: true } } },
  });

  if (existing) {
    const updated = await prisma.profile.update({
      where: { userId },
      data: {
        displayName: data.display_name,
        bio: data.bio ?? existing.bio,
        avatarMediaId: data.avatar_media_id !== undefined ? data.avatar_media_id : existing.avatarMediaId,
      },
      include: { avatarMedia: { select: { publicUrl: true } } },
    });
    return {
      profile: formatProfile(updated),
      onboarding: { is_complete: true },
    };
  }

  if (!data.username) {
    throw AppError.badRequest("MISSING_USERNAME", "Username is required for onboarding");
  }

  const normalized = data.username.toLowerCase().trim();
  if (!USERNAME_RE.test(normalized)) {
    throw AppError.badRequest("INVALID_USERNAME", "Username must be 3-30 chars, lowercase alphanumeric and hyphens");
  }

  const taken = await prisma.profile.findUnique({
    where: { username: normalized },
    select: { id: true },
  });
  if (taken) {
    throw AppError.conflict("USERNAME_TAKEN", "Username is already taken", { username: normalized });
  }

  const profile = await prisma.profile.create({
    data: {
      id: uuid(),
      userId,
      username: normalized,
      displayName: data.display_name,
      bio: data.bio ?? null,
      avatarMediaId: data.avatar_media_id ?? null,
    },
    include: { avatarMedia: { select: { publicUrl: true } } },
  });

  return {
    profile: formatProfile(profile),
    onboarding: { is_complete: true },
  };
}

export async function getOwnProfile(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      avatarMedia: { select: { publicUrl: true } },
      links: { orderBy: { position: "asc" } },
    },
  });

  if (!profile) {
    throw AppError.notFound("Profile");
  }

  return {
    profile: formatProfile(profile),
    links: profile.links.map(formatLink),
  };
}

function formatProfile(profile: {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarMedia?: { publicUrl: string } | null;
}) {
  return {
    id: profile.id,
    username: profile.username,
    display_name: profile.displayName,
    bio: profile.bio,
    avatar_url: profile.avatarMedia?.publicUrl ?? null,
  };
}

export async function replaceProfileLinks(
  userId: string,
  links: { link_type: string; label: string | null; url: string; position: number }[],
) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) throw AppError.notFound("Profile");

  await prisma.$transaction(async (tx) => {
    await tx.profileLink.deleteMany({ where: { profileId: profile.id } });
    if (links.length > 0) {
      await tx.profileLink.createMany({
        data: links.map((link) => ({
          id: uuid(),
          profileId: profile.id,
          linkType: link.link_type as "portfolio" | "github" | "linkedin" | "x" | "other",
          label: link.label,
          url: link.url,
          position: link.position,
        })),
      });
    }
  });

  const updated = await prisma.profileLink.findMany({
    where: { profileId: profile.id },
    orderBy: { position: "asc" },
  });

  return updated.map(formatLink);
}

function formatLink(link: {
  id: string;
  linkType: string;
  label: string | null;
  url: string;
  position: number;
}) {
  return {
    id: link.id,
    link_type: link.linkType,
    label: link.label,
    url: link.url,
    position: link.position,
  };
}
