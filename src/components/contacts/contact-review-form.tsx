"use client";

import { ReviewForm } from "@/components/shared/review-form";
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
  return (
    <ReviewForm
      apiPath={`/api/contacts/${contactId}/reviews`}
      idPrefix="contact-review"
      copy={contactsCopy}
      initialRating={initialRating}
      initialComment={initialComment}
      disabled={disabled}
    />
  );
}
