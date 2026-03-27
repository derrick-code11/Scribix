import { prisma } from "../config/prisma.js";
import { AppError } from "../lib/api-error.js";

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
