import { useParams } from 'react-router-dom'
import { EditorPage } from '@/features/editor/editor-page'

export function EditorRoute() {
  const { postId } = useParams()
  return <EditorPage key={postId} />
}
