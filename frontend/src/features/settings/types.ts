import type { ProfileLink } from "@/lib/types";

export interface OwnProfileResponse {
  profile: {
    id: string;
    username: string;
    display_name: string;
    bio: string | null;
    avatar_url: string | null;
  };
  links: ProfileLink[];
}
