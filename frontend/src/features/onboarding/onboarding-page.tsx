import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePageTitle } from "@/hooks/use-page-title";

const usernameRegex = /^[a-z0-9_]{3,30}$/;

const schema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(usernameRegex, "Lowercase letters, numbers, and underscores only"),
  display_name: z.string().min(1, "Display name is required").max(100),
  bio: z.string().max(500).optional(),
});

type Form = z.infer<typeof schema>;

export function OnboardingPage() {
  usePageTitle("Set up profile");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { bio: "" },
  });

  const username = watch("username");

  const onSubmit = async (data: Form) => {
    setFormError(null);
    setChecking(true);
    try {
      const availability = await api.checkUsernameAvailability(data.username);
      if (!availability.available) {
        setFormError("That username is already taken.");
        setChecking(false);
        return;
      }
      await api.updateProfile({
        username: data.username,
        display_name: data.display_name,
        bio: data.bio || null,
      });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/dashboard", { replace: true });
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : "That didn’t work. Try again.";
      setFormError(msg);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100dvh-80px)] items-center justify-center px-4 sm:px-6">
      <div className="relative w-full max-w-lg rounded-2xl border border-scribix-text/8 bg-scribix-panel p-8 shadow-sm sm:p-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-scribix-text/45">
          Profile
        </p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-scribix-text sm:text-4xl">
          Pick your{" "}
          <em className="not-italic text-scribix-primary">username</em>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-scribix-text/65">
          Your profile URL starts with{" "}
          <span className="font-mono text-scribix-text">
            /{username || "you"}
          </span>
          . You can’t change it later, so choose something you’re fine sharing.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
          {formError && (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {formError}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              placeholder="alexrivera"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="display_name">Display name</Label>
            <Input
              id="display_name"
              autoComplete="name"
              placeholder="Alex Rivera"
              {...register("display_name")}
            />
            {errors.display_name && (
              <p className="text-sm text-red-600">
                {errors.display_name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="Optional. A line or two about you."
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || checking}
          >
            {isSubmitting || checking ? "Saving…" : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
