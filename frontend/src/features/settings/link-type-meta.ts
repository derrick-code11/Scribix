export const LINK_TYPES = ["portfolio", "github", "linkedin", "x", "other"] as const;

export function getLinkTypeLabel(linkType: string): string {
  switch (linkType) {
    case "portfolio":
      return "Portfolio";
    case "github":
      return "GitHub";
    case "linkedin":
      return "LinkedIn";
    case "x":
      return "X";
    default:
      return "Other";
  }
}
