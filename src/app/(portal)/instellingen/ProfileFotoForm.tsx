"use client";

import { useActionState, useState } from "react";
import { Upload, User as UserIcon } from "lucide-react";

import { SERVICES } from "@/lib/services";
import {
  updateKlusserProfile,
  type SettingsState,
} from "./actions";

function FeedbackBanner({ state }: { state: SettingsState }) {
  if (!state) return null;
  if (state.error)
    return (
      <div
        className="rounded-lg border p-3 text-sm mb-4"
        style={{
          backgroundColor: "#fef2f2",
          borderColor: "#fecaca",
          color: "#991b1b",
        }}
      >
        {state.error}
      </div>
    );
  if (state.success)
    return (
      <div
        className="rounded-lg border p-3 text-sm mb-4"
        style={{
          backgroundColor: "#ecfdf5",
          borderColor: "#a7f3d0",
          color: "#065f46",
        }}
      >
        ✓ {state.success}
      </div>
    );
  return null;
}

export function ProfileFotoForm({
  defaults,
}: {
  defaults: {
    bio: string;
    photoUrl: string;
    specialties: string[];
  };
}) {
  const [photoUrl, setPhotoUrl] = useState(defaults.photoUrl);
  const [specialties, setSpecialties] = useState<string[]>(
    defaults.specialties,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updateKlusserProfile,
    undefined,
  );

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setUploadError(body.error ?? "Upload mislukt");
      setUploading(false);
      return;
    }
    const body = await res.json();
    setPhotoUrl(body.url);
    setUploading(false);
  }

  function toggleSpec(s: string) {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s].slice(0, 5),
    );
  }

  return (
    <form action={action} className="space-y-5">
      <FeedbackBanner state={state} />

      <div className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{
            backgroundColor: "#f1f5f9",
            border: "2px solid #e2e8f0",
          }}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon size={32} className="text-[#cbd5e1]" />
          )}
        </div>
        <div>
          <label className="kb-field-label">Profielfoto</label>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold cursor-pointer hover:bg-neutral-100"
            style={{ border: "1px solid #dde4ed" }}>
            <Upload size={14} />
            {uploading
              ? "Uploaden…"
              : photoUrl
                ? "Wijzig foto"
                : "Upload foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
          {photoUrl && (
            <button
              type="button"
              onClick={() => setPhotoUrl("")}
              className="ml-2 text-xs text-[#5c6878] hover:text-[#991b1b]"
            >
              Verwijder
            </button>
          )}
          {uploadError && (
            <p className="text-xs text-red-600 mt-1">{uploadError}</p>
          )}
        </div>
        <input type="hidden" name="photoUrl" value={photoUrl} />
      </div>

      <div>
        <label className="kb-field-label">Korte omschrijving (bio)</label>
        <textarea
          name="bio"
          rows={4}
          defaultValue={defaults.bio}
          maxLength={800}
          placeholder="Vertel iets over jezelf, je bedrijf en wat je goed kunt. Klanten zien deze tekst op je profielpagina."
          className="kb-textarea"
        />
      </div>

      <div>
        <label className="kb-field-label">Specialiteiten (max 5)</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {SERVICES.map((s) => {
            const isOn = specialties.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpec(s)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                style={{
                  border: `1.5px solid ${isOn ? "#3586b6" : "#dde4ed"}`,
                  backgroundColor: isOn ? "#eff6fc" : "#fff",
                  color: isOn ? "#1e4f70" : "#5c6878",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
        {specialties.map((s) => (
          <input key={s} type="hidden" name="specialties" value={s} />
        ))}
      </div>

      <button type="submit" disabled={pending} className="btn-yellow">
        {pending ? "Opslaan…" : "Klusser-profiel opslaan"}
      </button>
    </form>
  );
}
