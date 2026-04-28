import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuth } from "@/context/auth-context";
import { deleteAccount } from "@/api/auth";
import { DeleteAccountSection } from "@/features/settings/components/delete-account-section";
import { ProfileDetailsCard } from "@/features/settings/components/profile-details-card";
import { ProfileLinksCard } from "@/features/settings/components/profile-links-card";
import { EmbedSettingsCard } from "@/features/settings/components/embed-settings-card";
import { useProfileSettings } from "@/features/settings/hooks/use-profile-settings";
import { useEmbedSettings } from "@/features/settings/hooks/use-embed-settings";

export function SettingsPage() {
  usePageTitle("Settings");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile: authProfile, refreshProfile, signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const {
    profileQuery,
    displayName,
    setDisplayName,
    bio,
    setBio,
    avatarPreview,
    avatarUploading,
    profileSaved,
    handleAvatarSelect,
    profileMutation,
    links,
    linksSaved,
    linksMutation,
    addLink,
    removeLink,
    updateLink,
  } = useProfileSettings({ refreshProfile });

  const {
    embedSectionRef,
    embedLimit,
    setEmbedLimit,
    embedTarget,
    setEmbedTarget,
    embedClassPrefix,
    setEmbedClassPrefix,
    embedNewTab,
    setEmbedNewTab,
    copiedSnippet,
    normalizedUsername,
    widgetSnippet,
    dataSnippet,
    embedPreviewQuery,
    copySnippet,
  } = useEmbedSettings({ username: authProfile?.username, searchParams });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      await signOut();
      navigate("/", { replace: true });
    },
  });

  const canDelete =
    deleteConfirm.trim().toUpperCase() === "DELETE" && !deleteMutation.isPending;

  const resetDeleteState = () => {
    setDeleteOpen(false);
    setDeleteConfirm("");
  };

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

      <ProfileDetailsCard
        username={authProfile?.username}
        displayName={displayName}
        bio={bio}
        avatarPreview={avatarPreview}
        avatarUploading={avatarUploading}
        profileSaving={profileMutation.isPending}
        profileSaved={profileSaved}
        profileError={profileMutation.isError}
        onDisplayNameChange={setDisplayName}
        onBioChange={setBio}
        onAvatarClick={() => fileInputRef.current?.click()}
        onAvatarSelect={handleAvatarSelect}
        onSaveProfile={() => profileMutation.mutate()}
        fileInputRef={fileInputRef}
      />

      <ProfileLinksCard
        links={links}
        linksSaving={linksMutation.isPending}
        linksSaved={linksSaved}
        linksError={linksMutation.isError}
        onAddLink={addLink}
        onRemoveLink={removeLink}
        onUpdateLink={updateLink}
        onSaveLinks={() => linksMutation.mutate()}
      />

      <EmbedSettingsCard
        embedSectionRef={embedSectionRef}
        normalizedUsername={normalizedUsername}
        embedLimit={embedLimit}
        embedTarget={embedTarget}
        embedClassPrefix={embedClassPrefix}
        embedNewTab={embedNewTab}
        widgetSnippet={widgetSnippet}
        dataSnippet={dataSnippet}
        copiedSnippet={copiedSnippet}
        embedPreviewPending={embedPreviewQuery.isPending}
        embedPreviewError={embedPreviewQuery.isError}
        embedPreviewData={embedPreviewQuery.data}
        onEmbedLimitChange={setEmbedLimit}
        onEmbedTargetChange={setEmbedTarget}
        onEmbedClassPrefixChange={setEmbedClassPrefix}
        onEmbedNewTabChange={setEmbedNewTab}
        onCopySnippet={copySnippet}
      />

      <DeleteAccountSection
        deleteOpen={deleteOpen}
        onOpen={() => {
          setDeleteOpen(true);
          setDeleteConfirm("");
        }}
        onClose={resetDeleteState}
        deleteConfirm={deleteConfirm}
        onDeleteConfirmChange={setDeleteConfirm}
        canDelete={canDelete}
        deleteMutation={deleteMutation}
        onConfirmDelete={() => deleteMutation.mutate()}
      />
    </div>
  );
}
