import type { JSONContent } from '@tiptap/core'

export function normalizeTipTapDoc(json: unknown): JSONContent {
  if (json && typeof json === 'object' && 'type' in json && (json as { type: string }).type === 'doc') {
    return json as JSONContent
  }
  return { type: 'doc', content: [] }
}
