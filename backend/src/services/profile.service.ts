import { randomUUID } from "crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../lib/api-error.js";
import type {
  UpdateProfileInput,
  ReplaceLinksInput,
} from "../validators/profile.validators.js";
import type { LinkType } from "@prisma/client";

export async function checkUsernameAvailability(username: string) {
  const existing = await prisma.profile.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true },
  });

  return {
    username: username.toLowerCase(),
    available: !existing,
    reason: existing ? "taken" : null,
  };
}

export async function upsertProfile(userId: string, input: UpdateProfileInput) {
  const existing = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true, username: true },
  });

  if (!existing) {
    if (!input.username || !input.display_name) {
      throw AppError.badRequest(
        "ONBOARDING_INCOMPLETE",
        "Username and display name are required for initial profile setup"
      );
    }

    const usernameCheck = await checkUsernameAvailability(input.username);
    if (!usernameCheck.available) {
      throw AppError.conflict("USERNAME_TAKEN", "Username is already taken", {
        username: input.username,
      });
    }

    const profile = await prisma.profile.create({
      data: {
        id: randomUUID(),
        userId,
        username: input.username.toLowerCase(),
        displayName: input.display_name,
        bio: input.bio ?? null,
        avatarMediaId: input.avatar_media_id ?? null,
      },
      include: { avatarMedia: { select: { publicUrl: true } } },
    });

    return {
      profile: formatProfile(profile),
      onboarding: { is_complete: true },
    };
  }

  if (input.username && input.username.toLowerCase() !== existing.username) {
    throw AppError.badRequest(
      "USERNAME_IMMUTABLE",
      "Username cannot be changed after onboarding"
    );
  }

  const profile = await prisma.profile.update({
    where: { id: existing.id },
    data: {
      ...(input.display_name && { displayName: input.display_name }),
      ...(input.bio !== undefined && { bio: input.bio }),
      ...(input.avatar_media_id !== undefined && {
        avatarMediaId: input.avatar_media_id,
      }),
    },
    include: { avatarMedia: { select: { publicUrl: true } } },
  });

  return {
    profile: formatProfile(profile),
    onboarding: { is_complete: true },
  };
}

export async function replaceLinks(userId: string, input: ReplaceLinksInput) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    throw AppError.notFound("Profile");
  }

  await prisma.$transaction([
    prisma.profileLink.deleteMany({ where: { profileId: profile.id } }),
    ...input.links.map((link) =>
      prisma.profileLink.create({
        data: {
          id: randomUUID(),
          profileId: profile.id,
          linkType: link.link_type as LinkType,
          label: link.label ?? null,
          url: link.url,
          position: link.position,
        },
      })
    ),
  ]);

  const links = await prisma.profileLink.findMany({
    where: { profileId: profile.id },
    orderBy: { position: "asc" },
  });

  return links.map(formatLink);
}

export async function getEditableProfile(userId: string) {
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
