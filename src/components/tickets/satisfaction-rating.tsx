"use client";

import { useState, useTransition } from "react";
import { Star, Loader2 } from "lucide-react";

interface SatisfactionRatingProps {
  ticketId: string;
  onRated?: () => void;
}

export function SatisfactionRating({ ticketId, onRated }: SatisfactionRatingProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    startTransition(async () => {
      const res = await fetch(`/api/tickets/${ticketId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      if (res.ok) {
        setSubmitted(true);
        onRated?.();
      }
    });
  };

  if (submitted) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-center">
        <p className="text-sm font-medium text-green-800">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <h3 className="font-heading text-lg font-semibold">Rate this resolution</h3>
      <p className="text-sm text-muted-foreground">
        How satisfied are you with how this ticket was handled?
      </p>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className="p-1"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hovered || rating) ? "fill-gold text-gold" : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional: tell us more about your experience..."
        rows={3}
        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />

      <button
        onClick={handleSubmit}
        disabled={rating === 0 || pending}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Submit Rating
      </button>
    </div>
  );
}
