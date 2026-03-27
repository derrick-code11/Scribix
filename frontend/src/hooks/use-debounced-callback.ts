import { useCallback, useEffect, useRef } from 'react'

export function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number
): (...args: Args) => void {
  const fnRef = useRef(fn)
  const tRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  useEffect(() => () => clearTimeout(tRef.current), [])

  return useCallback(
    (...args: Args) => {
      clearTimeout(tRef.current)
      tRef.current = setTimeout(() => fnRef.current(...args), delay)
    },
    [delay]
  )
}
