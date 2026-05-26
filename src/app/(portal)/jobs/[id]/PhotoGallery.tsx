"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

export function PhotoGallery({
  photos,
}: {
  photos: { id: string; url: string }[];
}) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <section
        className="rounded-2xl flex items-center justify-center"
        style={{
          backgroundColor: "#f1f5f9",
          border: "1px dashed #cbd5e1",
          aspectRatio: "16 / 9",
        }}
      >
        <div className="text-center text-[#9aa6b5]">
          <ImageIcon size={32} className="mx-auto mb-2" />
          <p className="text-sm font-medium">Geen foto&apos;s bij deze klus</p>
        </div>
      </section>
    );
  }

  const main = photos[active];
  return (
    <section className="space-y-3">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#f1f5f9",
          border: "1px solid #e2e8f0",
          aspectRatio: "16 / 9",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={main.url}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(i)}
              className="rounded-lg overflow-hidden aspect-[4/3] transition-all"
              style={{
                border: `2px solid ${i === active ? "#3586b6" : "#e2e8f0"}`,
                opacity: i === active ? 1 : 0.75,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
