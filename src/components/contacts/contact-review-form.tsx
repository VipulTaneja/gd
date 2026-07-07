"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { StarRatingInput } from "@/components/shared/star-rating-input";
import { contacts as contactsCopy } from "@/lib/microcopy";

interface ContactReviewFormProps {
  contactId: string;
  initialRating?: number;
  initialComment?: string | null;
  disabled?: boolean;
}

export function ContactReviewForm({
  contactId,
  initialRating = 0,
  initialComment = "",
  disabled = false,
}: ContactReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (rating < 1) {
      setError("Please select a rating");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/contacts/${contactId}/reviews`, {
        method: initialRating > 0 ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not save rating");
        return;
      }
      window.location.reload();
    });
  };

  const remove = () => {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/contacts/${contactId}/reviews`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not remove rating");
        return;
      }
      window.location.reload();
    });
  };

  if (disabled) {
    return <p className="text-sm text-muted-foreground">{contactsCopy.notReviewable}</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">{contactsCopy.yourReview}</p>
        <StarRatingInput value={rating} onChange={setRating} disabled={pending} />
      </div>
      <div>
        <label htmlFor="contact-review-comment" className="sr-only">
          Review comment
        </label>
        <textarea
          id="contact-review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={contactsCopy.reviewPlaceholder}
          maxLength={500}
          rows={3}
          disabled={pending}
          className="w-full rounded-xl border bg-transparent px-3 py-2 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold min-h-11"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={pending || rating < 1}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : contactsCopy.submitReview}
        </button>
        {initialRating > 0 && (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-input px-4 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {contactsCopy.deleteReview}
          </button>
        )}
      </div>
    </div>
  );
}
