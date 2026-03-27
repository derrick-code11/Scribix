import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import * as api from '@/lib/api'
import type { ProfileLinkInput } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { usePageTitle } from '@/hooks/use-page-title'

const linkTypeEnum = z.enum(['portfolio', 'github', 'linkedin', 'x', 'other'])

const schema = z.object({
  display_name: z.string().min(1).max(100),
  bio: z.string().max(500),
  links: z.array(
    z.object({
      link_type: linkTypeEnum,
      label: z.string().max(50).optional().nullable(),
      url: z.string().url('Valid URL required'),
      position: z.number().int().min(0),
    })
  ),
})

type Form = z.infer<typeof schema>

export function SettingsPage() {
  usePageTitle('Settings')
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: api.fetchMyProfile,
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: '',
      bio: '',
      links: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'links' })

  useEffect(() => {
    if (!profileQuery.data) return
    const { profile, links } = profileQuery.data
    reset({
      display_name: profile.display_name,
      bio: profile.bio ?? '',
      links: links.map((l, i) => ({
        link_type: l.link_type as ProfileLinkInput['link_type'],
        label: l.label,
        url: l.url,
        position: i,
      })),
    })
  }, [profileQuery.data, reset])

  const saveMutation = useMutation({
    mutationFn: async (data: Form) => {
      await api.updateProfile({
        display_name: data.display_name,
        bio: data.bio.trim() || null,
      })
      const payload: ProfileLinkInput[] = data.links.map((l, i) => ({
        link_type: l.link_type,
        label: l.label ?? null,
        url: l.url,
        position: i,
      }))
      await api.replaceProfileLinks(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
      await queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const onSubmit = (data: Form) => {
    saveMutation.mutate(data)
  }

  if (profileQuery.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-scribix-text/50">Loading…</p>
      </div>
    )
  }

  if (profileQuery.isError) {
    return <p className="px-4 py-12 text-red-700">Settings didn’t load.</p>
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-scribix-text/45">
        Account
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-tight text-scribix-text">Settings</h1>
      <p className="mt-2 text-sm text-scribix-text/60">
        You can’t change your username here. Everything else is what people see on your public profile.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-8">
        <div className="space-y-2">
          <Label htmlFor="display_name">Display name</Label>
          <Input id="display_name" {...register('display_name')} />
          {errors.display_name && <p className="text-sm text-red-600">{errors.display_name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={4} {...register('bio')} />
          {errors.bio && <p className="text-sm text-red-600">{errors.bio.message}</p>}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Label>Links</Label>
            <Button
              type="button"
              variant="ghost"
              className="py-1! text-xs"
              onClick={() =>
                append({
                  link_type: 'other',
                  label: '',
                  url: 'https://',
                  position: fields.length,
                })
              }
            >
              + Add link
            </Button>
          </div>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-scribix-text/10 bg-scribix-surface-muted p-4"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      className="w-full rounded-lg border border-scribix-text/10 bg-scribix-panel px-3 py-2 text-sm"
                      {...register(`links.${index}.link_type` as const)}
                    >
                      <option value="portfolio">Portfolio</option>
                      <option value="github">GitHub</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="x">X</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Label (optional)</Label>
                    <Input {...register(`links.${index}.label` as const)} />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Label>URL</Label>
                  <Input type="url" {...register(`links.${index}.url` as const)} />
                  {errors.links?.[index]?.url && (
                    <p className="text-sm text-red-600">{errors.links[index]?.url?.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-3 font-mono text-xs text-red-700/80 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {saveMutation.isSuccess && (
          <p className="text-sm text-green-800">Saved.</p>
        )}
        {saveMutation.isError && (
          <p className="text-sm text-red-700">Save failed. Check the links and try again.</p>
        )}

        <Button type="submit" disabled={isSubmitting || saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </div>
  )
}
