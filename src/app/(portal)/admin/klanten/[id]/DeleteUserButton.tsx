"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";

import { adminDeleteUser } from "../actions";

export function DeleteUserButton({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  function show() {
    setOpen(true);
    dialogRef.current?.showModal();
  }
  function hide() {
    setOpen(false);
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold transition-colors"
        style={{
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          border: "1px solid #fecaca",
        }}
      >
        <Trash2 size={14} /> Verwijder
      </button>
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        className="backdrop:bg-black/60"
        style={{
          border: "none",
          padding: 0,
          background: "transparent",
          maxWidth: "min(420px, calc(100vw - 32px))",
          width: "100%",
          margin: "auto",
          position: "fixed",
          inset: 0,
          borderRadius: "16px",
        }}
      >
        {open && (
          <div
            className="bg-white p-6 rounded-2xl"
            style={{ boxShadow: "0 24px 64px rgba(15,37,53,0.32)" }}
          >
            <h2 className="kb-heading text-xl mb-2">Klant verwijderen?</h2>
            <p className="text-sm text-[#5c6878] mb-5">
              Je staat op het punt om <strong>{name}</strong> en alle
              gerelateerde klussen, claims, betalingen en reviews te
              verwijderen. Dit kan niet ongedaan gemaakt worden.
            </p>
            <div className="flex gap-3">
              <form
                action={async () => {
                  await adminDeleteUser(userId);
                }}
                className="flex-1"
              >
                <button
                  type="submit"
                  className="w-full rounded-md py-2.5 font-bold text-white"
                  style={{ backgroundColor: "#dc2626" }}
                >
                  Definitief verwijderen
                </button>
              </form>
              <button
                type="button"
                onClick={hide}
                className="flex-1 rounded-md py-2.5 font-semibold text-[#5c6878]"
                style={{ border: "1px solid #dde4ed" }}
              >
                Annuleer
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
