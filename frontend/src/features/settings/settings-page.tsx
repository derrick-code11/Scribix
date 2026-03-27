import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuth } from "@/context/auth-context";
import {
  upsertProfile,
  requestUploadUrl,
  registerMedia,
  uploadFileToS3,
  deleteAccount,
} from "@/api/auth";
import { replaceProfileLinks } from "@/api/posts";
import { authRequest } from "@/api/client";
import {
  LinkTypeIcon,
  LINK_TYPES,
  getLinkTypeMeta,
} from "@/features/settings/link-type-icon";
import { SettingsCard } from "@/features/settings/components/settings-card";
import { DeleteAccountSection } from "@/features/settings/components/delete-account-section";
import type { OwnProfileResponse } from "@/features/settings/types";

export function SettingsPage() {
  usePageTitle("Settings");
  const navigate = useNavigate();
  const { profile: authProfile, refreshProfile, signOut } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["own-profile"],
    queryFn: () => authRequest<OwnProfileResponse>("/profiles/me"),
  });

  const ownProfile = profileQuery.data;

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMediaId, setAvatarMediaId] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [links, setLinks] = useState<
    { link_type: string; label: string; url: string }[]
  >([]);
  const [linksSaved, setLinksSaved] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    if (ownProfile) {
      setDisplayName(ownProfile.profile.display_name);
      setBio(ownProfile.profile.bio || "");
      setAvatarPreview(ownProfile.profile.avatar_url);
      setLinks(
        ownProfile.links.map((l) => ({
          link_type: l.link_type,
          label: l.label || "",
          url: l.url,
        })),
      );
    }
  }, [ownProfile]);

  const handleAvatarSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!["image/png", "image/jpeg"].includes(file.type)) return;
      if (file.size > 5 * 1024 * 1024) return;

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
        setAvatarPreview(ownProfile?.profile.avatar_url || null);
        setAvatarMediaId(null);
      } finally {
        setAvatarUploading(false);
      }
    },
    [ownProfile],
  );

  const profileMutation = useMutation({
    mutationFn: () =>
      upsertProfile({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        ...(avatarMediaId && { avatar_media_id: avatarMediaId }),
      }),
    onSuccess: async () => {
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["own-profile"] });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    },
  });

  const linksMutation = useMutation({
    mutationFn: () =>
      replaceProfileLinks(
        links
          .filter((l) => l.url.trim())
          .map((l, i) => ({
            link_type: l.link_type,
            label: l.label.trim() || null,
            url: l.url.trim(),
            position: i,
          })),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["own-profile"] });
      setLinksSaved(true);
      setTimeout(() => setLinksSaved(false), 2000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      await signOut();
      navigate("/", { replace: true });
    },
  });

  const addLink = useCallback(() => {
    setLinks((prev) => [...prev, { link_type: "other", label: "", url: "" }]);
  }, []);

  const removeLink = useCallback((index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateLink = useCallback(
    (index: number, field: "link_type" | "label" | "url", value: string) => {
      setLinks((prev) =>
        prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)),
      );
    },
    [],
  );

  const canDelete =
    deleteConfirm.trim().toUpperCase() === "DELETE" && !deleteMutation.isPending;

  if (profileQuery.isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-scribix-text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-3 py-10 sm:px-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-scribix-text-muted">
        Settings
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-tight text-scribix-text sm:text-4xl">
        Your Profile
      </h1>

      <SettingsCard title="Profile Details" className="mt-10">
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-scribix-border bg-scribix-surface-muted transition-colors hover:border-scribix-primary/50 hover:bg-scribix-border-subtle"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-mono text-2xl text-scribix-text-muted">
                  {displayName?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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
            <div>
              <p className="text-sm text-scribix-text/80">Profile photo</p>
              <p className="text-xs text-scribix-text-muted">
                PNG or JPEG, max 5 MB
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-scribix-text-muted">
              Username
            </label>
            <div className="rounded-sm border border-scribix-border bg-scribix-surface-muted px-3 py-2.5 font-mono text-sm text-scribix-text-muted">
              scribix-tau.vercel.app/{authProfile?.username}
            </div>
            <p className="mt-1 text-[11px] text-scribix-text-muted">
              Username cannot be changed after onboarding
            </p>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-scribix-text-muted">
              Display Name
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-scribix-text-muted">
              Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short intro about yourself"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => profileMutation.mutate()}
              disabled={
                profileMutation.isPending || avatarUploading || !displayName.trim()
              }
            >
              {profileMutation.isPending ? "Saving…" : "Save Profile"}
            </Button>
            {profileSaved && (
              <span className="font-mono text-xs text-emerald-600">Saved</span>
            )}
            {profileMutation.isError && (
              <span className="font-mono text-xs text-red-600">
                Failed to save
              </span>
            )}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Profile Links" className="mt-8">
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-scribix-text-muted">
            Shown on your public profile. Pick a type so visitors see the right
            icon.
          </p>
          <button
            type="button"
            onClick={addLink}
            disabled={links.length >= 10}
            className="shrink-0 rounded-sm border border-scribix-border bg-scribix-surface-muted px-3 py-1.5 font-mono text-xs text-scribix-primary transition-colors hover:border-scribix-border-strong hover:bg-scribix-border-subtle disabled:opacity-40"
          >
            + Add link
          </button>
        </div>

        {links.length === 0 && (
          <p className="mt-6 rounded-lg border border-dashed border-scribix-border bg-scribix-surface-muted px-4 py-8 text-center text-sm text-scribix-text-muted">
            No links yet. Add your portfolio, GitHub, LinkedIn, or X.
          </p>
        )}

        <ul className="mt-5 space-y-3">
          {links.map((link, i) => (
            <li
              key={i}
              className="flex flex-col gap-3 rounded-xl border border-scribix-border bg-scribix-surface-muted p-3 shadow-sm transition-[border-color,box-shadow] hover:border-scribix-border-strong sm:flex-row sm:items-stretch"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-scribix-border bg-scribix-panel text-scribix-primary shadow-sm"
                title={getLinkTypeMeta(link.link_type).label}
              >
                <LinkTypeIcon linkType={link.link_type} className="h-5 w-5" />
              </div>

              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,9rem)_1fr_1.4fr] sm:items-center">
                <div className="relative">
                  <label className="sr-only">Link type</label>
                  <select
                    value={link.link_type}
                    onChange={(e) =>
                      updateLink(i, "link_type", e.target.value)
                    }
                    className="h-11 w-full appearance-none rounded-sm border border-scribix-border bg-scribix-panel py-2 pl-3 pr-8 font-mono text-xs text-scribix-text shadow-sm transition-[border-color,box-shadow] hover:border-scribix-border-strong focus-visible:border-scribix-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scribix-primary/35"
                  >
                    {LINK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {getLinkTypeMeta(t).label}
                      </option>
                    ))}
                  </select>
                  <span
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-scribix-text-muted"
                    aria-hidden
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </span>
                </div>
                <Input
                  value={link.label}
                  onChange={(e) => updateLink(i, "label", e.target.value)}
                  placeholder="Label (optional)"
                  className="text-xs"
                  aria-label="Link label"
                />
                <Input
                  value={link.url}
                  onChange={(e) => updateLink(i, "url", e.target.value)}
                  placeholder="https://…"
                  className="text-xs sm:min-w-0"
                  inputMode="url"
                  aria-label="URL"
                />
              </div>

              <button
                type="button"
                onClick={() => removeLink(i)}
                className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-sm border border-transparent text-scribix-text-muted transition-colors hover:border-scribix-border hover:bg-red-500/8 hover:text-red-600 sm:self-center"
                aria-label="Remove link"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center gap-3">
          <Button
            onClick={() => linksMutation.mutate()}
            disabled={linksMutation.isPending}
          >
            {linksMutation.isPending ? "Saving…" : "Save Links"}
          </Button>
          {linksSaved && (
            <span className="font-mono text-xs text-emerald-600">Saved</span>
          )}
          {linksMutation.isError && (
            <span className="font-mono text-xs text-red-600">
              Failed to save
            </span>
          )}
        </div>
      </SettingsCard>

      <DeleteAccountSection
        deleteOpen={deleteOpen}
        onOpen={() => {
          setDeleteOpen(true);
          setDeleteConfirm("");
        }}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteConfirm("");
        }}
        deleteConfirm={deleteConfirm}
        onDeleteConfirmChange={setDeleteConfirm}
        canDelete={canDelete}
        deleteMutation={deleteMutation}
        onConfirmDelete={() => deleteMutation.mutate()}
      />
    </div>
  );
}
