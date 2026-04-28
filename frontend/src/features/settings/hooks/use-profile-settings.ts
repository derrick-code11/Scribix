import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  upsertProfile,
  requestUploadUrl,
  registerMedia,
  uploadFileToS3,
} from "@/api/auth";
import { replaceProfileLinks } from "@/api/posts";
import { authRequest } from "@/api/client";
import type { OwnProfileResponse } from "@/features/settings/types";
import { useTransientFlag } from "@/features/settings/hooks/use-transient-flag";

export interface ProfileLinkDraft {
  link_type: string;
  label: string;
  url: string;
}

export function useProfileSettings({
  refreshProfile,
}: {
  refreshProfile: () => Promise<unknown>;
}) {
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
  const profileSavedFlag = useTransientFlag(2000);
  const [links, setLinks] = useState<ProfileLinkDraft[]>([]);
  const linksSavedFlag = useTransientFlag(2000);

  useEffect(() => {
    if (!ownProfile) return;
    setDisplayName(ownProfile.profile.display_name);
    setBio(ownProfile.profile.bio || "");
    setAvatarPreview(ownProfile.profile.avatar_url);
    setLinks(
      ownProfile.links.map((link) => ({
        link_type: link.link_type,
        label: link.label || "",
        url: link.url,
      })),
    );
  }, [ownProfile]);

  const handleAvatarSelect = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
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
    [ownProfile?.profile.avatar_url],
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
      profileSavedFlag.trigger();
    },
  });

  const linksMutation = useMutation({
    mutationFn: () =>
      replaceProfileLinks(
        links
          .filter((link) => link.url.trim())
          .map((link, index) => ({
            link_type: link.link_type,
            label: link.label.trim() || null,
            url: link.url.trim(),
            position: index,
          })),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["own-profile"] });
      linksSavedFlag.trigger();
    },
  });

  const addLink = useCallback(() => {
    setLinks((previous) => [...previous, { link_type: "other", label: "", url: "" }]);
  }, []);

  const removeLink = useCallback((index: number) => {
    setLinks((previous) => previous.filter((_, linkIndex) => linkIndex !== index));
  }, []);

  const updateLink = useCallback(
    (index: number, field: "link_type" | "label" | "url", value: string) => {
      setLinks((previous) =>
        previous.map((link, linkIndex) =>
          linkIndex === index ? { ...link, [field]: value } : link,
        ),
      );
    },
    [],
  );

  return {
    profileQuery,
    displayName,
    setDisplayName,
    bio,
    setBio,
    avatarPreview,
    avatarUploading,
    profileSaved: profileSavedFlag.active,
    handleAvatarSelect,
    profileMutation,
    links,
    linksSaved: linksSavedFlag.active,
    linksMutation,
    addLink,
    removeLink,
    updateLink,
  };
}
