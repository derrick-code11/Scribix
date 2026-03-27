import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePageTitle } from "@/hooks/use-page-title";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type Form = z.infer<typeof schema>;

export function LoginPage() {
  usePageTitle("Log in");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const from =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setFormError(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : "That didn’t work. Try again.";
      setFormError(msg);
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setFormError("Google didn’t return a sign-in. Try again.");
      return;
    }
    setFormError(null);
    try {
      await loginWithGoogle(response.credential);
      navigate(from, { replace: true });
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : "Google sign-in didn’t work";
      setFormError(msg);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100dvh-80px)] items-center justify-center px-4 sm:px-6">
      <div className="relative w-full max-w-md rounded-2xl border border-scribix-text/8 bg-scribix-panel p-8 shadow-sm sm:p-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-scribix-text/45">
          Log in
        </p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-scribix-text sm:text-4xl">
          Back to <em className="not-italic text-scribix-primary">Scribix</em>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-scribix-text/65">
          Same email and password you used when you signed up.
        </p>

        <div className="mt-8 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setFormError("Google sign-in was cancelled.")}
            theme="outline"
            size="large"
            width="100%"
            text="continue_with"
            shape="rectangular"
          />
        </div>

        <div className="relative mt-6 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-scribix-text/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-scribix-panel px-3 font-mono text-[10px] uppercase tracking-wider text-scribix-text/40">
              or
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {formError && (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {formError}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Log in"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-scribix-text/60">
          No account?{" "}
          <Link
            to="/signup"
            className="font-medium text-scribix-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
