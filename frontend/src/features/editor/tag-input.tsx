import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { searchTags } from "@/api/posts";

export function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebouncedCallback((val: string) => {
    setQuery(val);
  }, 250);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      debouncedSearch(e.target.value);
      setShowSuggestions(true);
    },
    [debouncedSearch],
  );

  const suggestionsQuery = useQuery({
    queryKey: ["tags", query],
    queryFn: () => searchTags(query || undefined),
    enabled: showSuggestions && query.length > 0,
  });

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
        onChange([...tags, trimmed]);
      }
      setInput("");
      setQuery("");
      setShowSuggestions(false);
      inputRef.current?.focus();
    },
    [tags, onChange],
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index));
    },
    [tags, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        if (input.trim()) addTag(input);
      } else if (e.key === "Backspace" && !input && tags.length > 0) {
        removeTag(tags.length - 1);
      }
    },
    [input, tags, addTag, removeTag],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const suggestions = (suggestionsQuery.data ?? []).filter(
    (t) => !tags.includes(t.name),
  );

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap items-center gap-1.5 rounded-sm border border-scribix-text/15 bg-scribix-bg px-2.5 py-2 focus-within:ring-2 focus-within:ring-scribix-primary/35">
        {tags.map((tag, i) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-scribix-surface-tint px-2.5 py-0.5 font-mono text-[11px] text-scribix-text/70"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="ml-0.5 text-scribix-text/40 hover:text-scribix-text"
            >
              &times;
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => input && setShowSuggestions(true)}
          placeholder={tags.length === 0 ? "Add tags…" : ""}
          className="min-w-[80px] flex-1 bg-transparent font-mono text-xs text-scribix-text outline-none placeholder:text-scribix-text/35"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-40 overflow-auto rounded-lg border border-scribix-text/10 bg-scribix-panel shadow-lg">
          {suggestions.map((tag) => (
            <li key={tag.id}>
              <button
                type="button"
                onClick={() => addTag(tag.name)}
                className="w-full px-3 py-2 text-left font-mono text-xs text-scribix-text/70 transition-colors hover:bg-scribix-surface-muted"
              >
                {tag.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
