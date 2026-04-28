import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SettingsCard } from "@/features/settings/components/settings-card";
import { SettingsFieldLabel } from "@/features/settings/components/settings-field-label";
import type { ChangeEvent, RefObject } from "react";

interface ProfileDetailsCardProps {
  username?: string;
  displayName: string;
  bio: string;
  avatarPreview: string | null;
  avatarUploading: boolean;
  profileSaving: boolean;
  profileSaved: boolean;
  profileError: boolean;
  onDisplayNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onAvatarClick: () => void;
  onAvatarSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onSaveProfile: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

export function ProfileDetailsCard({
  username,
  displayName,
  bio,
  avatarPreview,
  avatarUploading,
  profileSaving,
  profileSaved,
  profileError,
  onDisplayNameChange,
  onBioChange,
  onAvatarClick,
  onAvatarSelect,
  onSaveProfile,
  fileInputRef,
}: ProfileDetailsCardProps) {
  return (
    <SettingsCard title="Profile Details" className="mt-10">
      <div className="mt-6 space-y-6">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={onAvatarClick}
            className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-scribix-border bg-scribix-surface-muted transition-colors hover:border-scribix-primary/50 hover:bg-scribix-border-subtle"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
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
            onChange={onAvatarSelect}
          />
          <div>
            <p className="text-sm text-scribix-text/80">Profile photo</p>
            <p className="text-xs text-scribix-text-muted">PNG or JPEG, max 5 MB</p>
          </div>
        </div>

        <div>
          <SettingsFieldLabel>Username</SettingsFieldLabel>
          <div className="rounded-sm border border-scribix-border bg-scribix-surface-muted px-3 py-2.5 font-mono text-sm text-scribix-text-muted">
            scribix-tau.vercel.app/{username}
          </div>
          <p className="mt-1 text-[11px] text-scribix-text-muted">
            Username cannot be changed after onboarding
          </p>
        </div>

        <div>
          <SettingsFieldLabel>Display Name</SettingsFieldLabel>
          <Input
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            placeholder="Your Name"
          />
        </div>

        <div>
          <SettingsFieldLabel>Bio</SettingsFieldLabel>
          <Textarea
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            placeholder="A short intro about yourself"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onSaveProfile}
            disabled={profileSaving || avatarUploading || !displayName.trim()}
          >
            {profileSaving ? "Saving…" : "Save Profile"}
          </Button>
          {profileSaved && <span className="font-mono text-xs text-emerald-600">Saved</span>}
          {profileError && (
            <span className="font-mono text-xs text-red-600">Failed to save</span>
          )}
        </div>
      </div>
    </SettingsCard>
  );
}
