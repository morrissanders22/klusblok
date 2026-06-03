"use client";

import { useState, useTransition } from "react";
import { UserCog } from "lucide-react";

import { adminImpersonateUser } from "../actions";

export function ImpersonateButton({
  userId,
  label,
}: {
  userId: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <span className="text-xs text-[#5c6878]">
          Je gaat verder als{" "}
          <strong className="text-[#1a2535]">{label}</strong>. Klopt dat?
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await adminImpersonateUser(userId);
              })
            }
            className="btn-yellow !px-3 !py-1.5 text-xs"
          >
            {pending ? "Inloggen…" : "Ja, inloggen"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(false)}
            className="btn-outline !px-3 !py-1.5 text-xs"
          >
            Annuleer
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="btn-outline !px-3 !py-1.5 text-xs inline-flex items-center gap-1.5"
    >
      <UserCog size={13} /> Inloggen als deze gebruiker
    </button>
  );
}
