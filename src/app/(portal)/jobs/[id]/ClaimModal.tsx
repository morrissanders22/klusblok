"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CreditCard, X, Clock, MapPin, Tag, CheckCircle2 } from "lucide-react";

import { startClaim, type ClaimResult } from "./actions";
import { formatEuro } from "@/lib/services";

export function ClaimModal({
  jobId,
  jobTitle,
  city,
  tierLabel,
  priceCents,
  autoOpen = false,
}: {
  jobId: string;
  jobTitle: string;
  city: string;
  tierLabel: string;
  priceCents: number;
  autoOpen?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(autoOpen);
  const [state, action, pending] = useActionState<ClaimResult, FormData>(
    startClaim,
    undefined,
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="flex items-center gap-4 flex-wrap">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
        >
          <CheckCircle2 size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1a2535]">Neem deze klus aan</p>
          <p className="text-sm text-[#5c6878]">
            Eenmalig {formatEuro(priceCents)} · contactgegevens direct na
            betaling
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-yellow"
        >
          <CreditCard size={16} /> Klus aannemen voor {formatEuro(priceCents)}
        </button>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        className="backdrop:bg-black/60 backdrop:backdrop-blur-sm"
        style={{
          border: "none",
          padding: 0,
          background: "transparent",
          maxWidth: "min(440px, calc(100vw - 32px))",
          width: "100%",
          margin: "auto",
          position: "fixed",
          inset: 0,
          borderRadius: "16px",
          overflow: "visible",
        }}
      >
        <div
          className="bg-white overflow-hidden"
          style={{ borderRadius: "16px", boxShadow: "0 24px 64px rgba(15,37,53,0.32)" }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #1e4f70 0%, #3586b6 100%)",
              padding: "24px 28px",
              color: "white",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Sluiten"
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
            <p
              className="kb-eyebrow"
              style={{ color: "#f7c021", opacity: 1 }}
            >
              Klus aannemen
            </p>
            <p
              className="kb-heading text-xl mt-1.5"
              style={{ color: "white" }}
            >
              {jobTitle}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10">
                <MapPin size={10} /> {city}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10">
                <Tag size={10} /> {tierLabel}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-7 space-y-5">
            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a", border: "1px solid #fde68a" }}
            >
              <Clock size={18} className="text-[#92400e] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[#92400e]">
                <strong>Let op:</strong> Na betaling heb je <strong>2 uur</strong>{" "}
                de tijd om contact op te nemen met de klant. Daarna komt de klus
                weer beschikbaar.
              </div>
            </div>

            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#5c6878]">Klusprijs</dt>
                <dd className="font-semibold">{formatEuro(priceCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#5c6878]">Betaling</dt>
                <dd className="font-semibold">iDEAL / creditcard</dd>
              </div>
              <div
                className="flex justify-between pt-3 items-baseline"
                style={{ borderTop: "1px solid #eef2f7" }}
              >
                <dt className="font-bold">Totaal</dt>
                <dd className="kb-heading text-2xl text-[#3586b6]">
                  {formatEuro(priceCents)}
                </dd>
              </div>
            </dl>

            {state?.error && (
              <div
                className="rounded-lg border p-3 text-sm"
                style={{
                  backgroundColor: "#fef2f2",
                  borderColor: "#fecaca",
                  color: "#991b1b",
                }}
              >
                {state.error}
              </div>
            )}

            <form action={action} className="space-y-2">
              <input type="hidden" name="jobId" value={jobId} />
              <button
                type="submit"
                disabled={pending}
                className="btn-yellow w-full justify-center"
                style={{ padding: "14px 24px", fontSize: "15px" }}
              >
                <CreditCard size={16} />
                {pending
                  ? "Doorsturen naar betaling…"
                  : `Betaal ${formatEuro(priceCents)} en claim`}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-md py-2 text-sm font-semibold text-[#5c6878] hover:bg-neutral-50"
              >
                Annuleren
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
