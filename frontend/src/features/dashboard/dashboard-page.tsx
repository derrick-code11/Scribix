import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuth } from "@/context/auth-context";

export function DashboardPage() {
  usePageTitle("Dashboard");
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-scribix-text/45">
        Dashboard
      </p>
      <h1 className="mt-3 font-display text-3xl tracking-tight text-scribix-text sm:text-4xl">
        Welcome back,{" "}
        <em className="not-italic text-scribix-primary">
          {profile?.display_name ?? "writer"}
        </em>
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-scribix-text/60">
        Your profile is live at{" "}
        <span className="font-mono text-scribix-text/80">
          scribix.com/{profile?.username}
        </span>
        . The editor and post management are coming soon.
      </p>

      <div className="mt-10 flex gap-3">
        <Button variant="secondary" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
