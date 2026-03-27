export function HeroDecor() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-scribix-primary"
      viewBox="0 0 1200 400"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <path
        d="M -40 140 Q 220 40 520 120 T 1240 80"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.08"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M 1240 260 Q 920 200 640 240 T 0 220"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.06"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
