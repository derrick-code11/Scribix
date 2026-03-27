import { Link, type LinkProps } from "react-router-dom";

const sizeClass = {
  sm: "text-lg leading-none",
  md: "text-xl leading-none sm:text-2xl",
  lg: "text-2xl leading-none sm:text-[1.75rem]",
} as const;

export function BrandLogo({
  to = "/",
  size = "md",
  className = "",
}: {
  to?: LinkProps["to"];
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={`font-display tracking-tight text-scribix-text transition-opacity hover:opacity-85 ${sizeClass[size]} ${className}`}
    >
      Scribix
    </Link>
  );
}
