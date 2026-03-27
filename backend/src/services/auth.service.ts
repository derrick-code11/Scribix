import { randomUUID } from "crypto";
import { prisma } from "../config/prisma.js";
import { hashPassword, comparePassword } from "../lib/hash.js";
import { signAccessToken } from "../lib/jwt.js";
import { AppError } from "../lib/api-error.js";
import { env } from "../config/env.js";
import { OAuth2Client } from "google-auth-library";
import type { SignupInput, LoginInput } from "../validators/auth.validators.js";

const googleClient = new OAuth2Client(env.googleClientId);

export async function signup(input: SignupInput) {
  const existing = await prisma.authIdentity.findUnique({
    where: {
      provider_email: { provider: "email", email: input.email.toLowerCase() },
    },
  });

  if (existing) {
    throw AppError.conflict("EMAIL_TAKEN", "An account with this email already exists", {
      email: input.email,
    });
  }

  const userId = randomUUID();
  const identityId = randomUUID();
  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      id: userId,
      authIdentities: {
        create: {
          id: identityId,
          provider: "email",
          email: input.email.toLowerCase(),
          passwordHash,
        },
      },
    },
    select: { id: true, status: true, createdAt: true },
  });

  const token = signAccessToken(user.id);

  return { user, token };
}

export async function login(input: LoginInput) {
  const identity = await prisma.authIdentity.findUnique({
    where: {
      provider_email: { provider: "email", email: input.email.toLowerCase() },
    },
    include: { user: { select: { id: true, status: true } } },
  });

  if (!identity || !identity.passwordHash) {
    throw AppError.unauthorized("Invalid email or password");
  }

  if (identity.user.status !== "active") {
    throw AppError.forbidden("Account is suspended or deleted");
  }

  const valid = await comparePassword(input.password, identity.passwordHash);
  if (!valid) {
    throw AppError.unauthorized("Invalid email or password");
  }

  await prisma.authIdentity.update({
    where: { id: identity.id },
    data: { lastLoginAt: new Date() },
  });

  const token = signAccessToken(identity.user.id);

  return { user: identity.user, token };
}

export async function googleLogin(idToken: string) {
  if (!env.googleClientId) {
    throw AppError.badRequest("GOOGLE_NOT_CONFIGURED", "Google sign-in is not configured");
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.googleClientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw AppError.unauthorized("Invalid Google token");
  }

  if (!payload || !payload.sub || !payload.email) {
    throw AppError.unauthorized("Invalid Google token payload");
  }

  const googleUserId = payload.sub;
  const email = payload.email.toLowerCase();

  // Try to find existing Google identity
  const existing = await prisma.authIdentity.findUnique({
    where: {
      provider_providerUserId: { provider: "google", providerUserId: googleUserId },
    },
    include: { user: { select: { id: true, status: true } } },
  });

  if (existing) {
    if (existing.user.status !== "active") {
      throw AppError.forbidden("Account is suspended or deleted");
    }

    await prisma.authIdentity.update({
      where: { id: existing.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signAccessToken(existing.user.id);
    return { user: existing.user, token };
  }

  // Check if an email identity already exists; link to same user
  const emailIdentity = await prisma.authIdentity.findUnique({
    where: { provider_email: { provider: "email", email } },
    include: { user: { select: { id: true, status: true } } },
  });

  if (emailIdentity) {
    // Link Google identity to existing user
    await prisma.authIdentity.create({
      data: {
        id: randomUUID(),
        userId: emailIdentity.userId,
        provider: "google",
        providerUserId: googleUserId,
        email,
        emailVerifiedAt: payload.email_verified ? new Date() : null,
        lastLoginAt: new Date(),
      },
    });

    const token = signAccessToken(emailIdentity.user.id);
    return { user: emailIdentity.user, token };
  }

  // Create brand new user with Google identity
  const userId = randomUUID();
  const user = await prisma.user.create({
    data: {
      id: userId,
      authIdentities: {
        create: {
          id: randomUUID(),
          provider: "google",
          providerUserId: googleUserId,
          email,
          emailVerifiedAt: payload.email_verified ? new Date() : null,
          lastLoginAt: new Date(),
        },
      },
    },
    select: { id: true, status: true, createdAt: true },
  });

  const token = signAccessToken(user.id);
  return { user, token };
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
