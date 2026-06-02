"use client";

import { useEffect, useState } from "react";

const MAX = 4;

export function PhotoUploader({
  minCount = 0,
  onCountChange,
}: {
  minCount?: number;
  onCountChange?: (count: number) => void;
}) {
  const [urls, setUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onCountChange?.(urls.length);
  }, [urls.length, onCountChange]);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setError(null);
    const room = MAX - urls.length;
    if (room <= 0) return;

    const next: string[] = [];
    setUploading(true);
    for (const file of Array.from(files).slice(0, room)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Upload mislukt");
        setUploading(false);
        return;
      }
      const body = await res.json();
      next.push(body.url);
    }
    setUrls((prev) => [...prev, ...next]);
    setUploading(false);
  }

  return (
    <div className="space-y-3">
      <label className="kb-field-label">
        Foto&apos;s ({urls.length} / {MAX}
        {minCount > 0 ? `, minimaal ${minCount}` : ""})
      </label>
      <div className="grid grid-cols-4 gap-3">
        {urls.map((url, i) => (
          <div
            key={url}
            className="relative aspect-square rounded-lg overflow-hidden"
            style={{ border: "1px solid #e2e8f0" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <input type="hidden" name="photos" value={url} />
            <button
              type="button"
              onClick={() => setUrls(urls.filter((_, j) => j !== i))}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/95 text-[#5c6878] hover:text-[#dc2626] flex items-center justify-center text-xs shadow-sm"
              aria-label="Verwijder foto"
            >
              ✕
            </button>
          </div>
        ))}
        {urls.length < MAX && (
          <label
            className="flex flex-col items-center justify-center aspect-square rounded-lg cursor-pointer text-sm font-medium"
            style={{
              border: `2px dashed ${urls.length < minCount ? "#f7c021" : "#cbd5e1"}`,
              backgroundColor:
                urls.length < minCount ? "#fffbeb" : "transparent",
              color: urls.length < minCount ? "#92400e" : "#5c6878",
            }}
          >
            <span className="text-xl">{uploading ? "…" : "+"}</span>
            <span className="text-xs mt-1">
              {uploading ? "Uploaden" : "Foto"}
            </span>
          </label>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-[#5c6878]">
        JPG, PNG of WEBP. Maximaal 5 MB per foto.
      </p>
    </div>
  );
}
