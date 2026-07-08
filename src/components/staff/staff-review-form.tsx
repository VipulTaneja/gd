"use client";

import { ReviewForm } from "@/components/shared/review-form";
import { staff as staffCopy } from "@/lib/microcopy";

interface StaffReviewFormProps {
  staffPersonId: string;
  initialRating?: number;
  initialComment?: string | null;
  onSuccess?: () => void;
}

export function StaffReviewForm({
  staffPersonId,
  initialRating = 0,
  initialComment = "",
  onSuccess,
}: StaffReviewFormProps) {
  return (
    <ReviewForm
      apiPath={`/api/staff/${staffPersonId}/reviews`}
      idPrefix="staff-review"
      copy={staffCopy}
      initialRating={initialRating}
      initialComment={initialComment}
      onSuccess={onSuccess}
    />
  );
}
