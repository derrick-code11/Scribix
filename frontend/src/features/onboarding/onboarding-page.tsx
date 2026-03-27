import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuth } from "@/context/auth-context";
import {
  checkUsernameAvailability,
  upsertProfile,
  requestUploadUrl,
  registerMedia,
  uploadFileToS3,
} from "@/lib/auth-api";

const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(30, "Max 30 characters")
    .regex(
      /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/,
      "Lowercase letters, numbers, and hyphens only",
    ),
  display_name: z.string().min(1, "Required").max(100),
  bio: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof onboardingSchema>;

export function OnboardingPage() {
  usePageTitle("Set up your profile");
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMediaId, setAvatarMediaId] = useState<string | null>(null);

  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(onboardingSchema),
    defaultValues: { username: "", display_name: "", bio: "" },
  });

  const watchedUsername = watch("username");

  useEffect(() => {
    clearTimeout(debounceRef.current);
    const val = watchedUsername?.toLowerCase().trim();
    if (!val || val.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(val);
        setUsernameStatus(result.available ? "available" : (result.reason === "invalid" ? "invalid" : "taken"));
      } catch {
        setUsernameStatus("idle");
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [watchedUsername]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!["image/png", "image/jpeg"].includes(file.type)) {
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setAvatarUploading(true);

      try {
        const { upload_url, storage_key } = await requestUploadUrl({
          file_name: file.name,
          mime_type: file.type,
          file_size_bytes: file.size,
          asset_type: "avatar",
        });
        await uploadFileToS3(upload_url, file);
        const media = await registerMedia({
          storage_key,
          asset_type: "avatar",
          mime_type: file.type,
          file_size_bytes: file.size,
        });
        setAvatarMediaId(media.id);
      } catch {
        setAvatarFile(null);
        setAvatarPreview(null);
        setAvatarMediaId(null);
      } finally {
        setAvatarUploading(false);
      }
    },
    [],
  );

  const onSubmit = async (values: FormValues) => {
    if (usernameStatus === "taken") {
      setError("username", { message: "Username is taken" });
      return;
    }
    if (usernameStatus === "invalid") {
      setError("username", { message: "Invalid username format" });
      return;
    }

    try {
      await upsertProfile({
        username: values.username.toLowerCase().trim(),
        display_name: values.display_name.trim(),
        bio: values.bio?.trim() || null,
        avatar_media_id: avatarMediaId,
      });
      await refreshProfile();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError("root", { message });
    }
  };

  return (
    <div className="relative flex min-h-[calc(100dvh-80px)] items-center justify-center px-4 py-12 sm:px-6">
      <div className="relative w-full max-w-lg rounded-2xl border border-scribix-text/8 bg-scribix-panel p-8 shadow-sm sm:p-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-scribix-text/45">
          Onboarding
        </p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-scribix-text sm:text-4xl">
          Set up your{" "}
          <em className="not-italic text-scribix-primary">profile</em>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-scribix-text/65">
          Pick a unique username for your public profile URL. You won't be able
          to change it later.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-scribix-text/15 bg-scribix-surface-muted transition-colors hover:border-scribix-primary/40"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg
                  className="h-8 w-8 text-scribix-text/30 transition-colors group-hover:text-scribix-primary/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
                  />
                </svg>
              )}
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleAvatarSelect}
            />
            <p className="text-xs text-scribix-text/45">
              {avatarFile ? avatarFile.name : "Click to upload avatar (optional)"}
            </p>
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block font-mono text-xs uppercase tracking-wider text-scribix-text/60"
            >
              Username
            </label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-scribix-text/35">
                scribix.com/
              </span>
              <input
                id="username"
                type="text"
                autoComplete="off"
                className="w-full rounded-lg border border-scribix-text/12 bg-scribix-bg px-3 py-2.5 pl-23 text-sm text-scribix-text placeholder:text-scribix-text/30 focus:border-scribix-primary/40 focus:outline-none focus:ring-2 focus:ring-scribix-primary/15"
                placeholder="your-username"
                {...register("username")}
              />
              {usernameStatus === "checking" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-scribix-text/20 border-t-scribix-primary" />
                </span>
              )}
              {usernameStatus === "available" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
              )}
              {usernameStatus === "taken" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </span>
              )}
            </div>
            {errors.username && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.username.message}
              </p>
            )}
            {usernameStatus === "taken" && !errors.username && (
              <p className="mt-1.5 text-xs text-red-600">
                This username is already taken
              </p>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label
              htmlFor="display_name"
              className="block font-mono text-xs uppercase tracking-wider text-scribix-text/60"
            >
              Display name
            </label>
            <input
              id="display_name"
              type="text"
              className="mt-2 w-full rounded-lg border border-scribix-text/12 bg-scribix-bg px-3 py-2.5 text-sm text-scribix-text placeholder:text-scribix-text/30 focus:border-scribix-primary/40 focus:outline-none focus:ring-2 focus:ring-scribix-primary/15"
              placeholder="Your Name"
              {...register("display_name")}
            />
            {errors.display_name && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.display_name.message}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="block font-mono text-xs uppercase tracking-wider text-scribix-text/60"
            >
              Bio{" "}
              <span className="normal-case tracking-normal text-scribix-text/35">
                (optional)
              </span>
            </label>
            <textarea
              id="bio"
              rows={3}
              className="mt-2 w-full resize-none rounded-lg border border-scribix-text/12 bg-scribix-bg px-3 py-2.5 text-sm text-scribix-text placeholder:text-scribix-text/30 focus:border-scribix-primary/40 focus:outline-none focus:ring-2 focus:ring-scribix-primary/15"
              placeholder="A short intro about yourself"
              {...register("bio")}
            />
            {errors.bio && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.bio.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
              role="alert"
            >
              {errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || avatarUploading}
          >
            {isSubmitting ? "Creating profile\u2026" : "Complete setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}
