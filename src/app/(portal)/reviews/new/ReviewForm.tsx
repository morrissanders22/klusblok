"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { createReview, type ReviewState } from "./actions";

export function ReviewForm({ claimId }: { claimId: string }) {
  const [rating, setRating] = useState(5);
  const [state, action, pending] = useActionState<ReviewState, FormData>(
    createReview,
    undefined,
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="claimId" value={claimId} />
      <input type="hidden" name="rating" value={rating} />
      <div>
        <label className="kb-field-label">Beoordeling</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="transition-transform hover:scale-110"
              aria-label={`${n} ster${n > 1 ? "ren" : ""}`}
            >
              <Star
                size={32}
                fill={n <= rating ? "#f6b42c" : "transparent"}
                color={n <= rating ? "#f6b42c" : "#cbd5e1"}
                strokeWidth={2}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="kb-field-label">Jouw ervaring</label>
        <textarea
          name="body"
          required
          rows={5}
          minLength={10}
          placeholder="Hoe was de communicatie? Was het werk netjes uitgevoerd?"
          className="kb-textarea"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="btn-yellow w-full justify-center"
      >
        {pending ? "Versturen..." : "Review plaatsen"}
      </button>
    </form>
  );
}
