import { Star } from "lucide-react";
import { UserLink } from "@/components/shared/user-link";
import { SoftCard } from "@/components/shared/soft-card";
import { contacts as contactsCopy } from "@/lib/microcopy";
import { cn } from "@/lib/utils";

export interface ContactReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string | Date;
  author: { id: string; name: string; avatarUrl?: string | null };
}

interface ContactReviewListProps {
  reviews: ContactReviewItem[];
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn("h-4 w-4", star <= rating ? "fill-gold text-gold" : "text-muted-foreground/40")}
        />
      ))}
    </div>
  );
}

export function ContactReviewList({ reviews }: ContactReviewListProps) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">{contactsCopy.noReviews}</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <SoftCard key={review.id} accent="emerald" className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <UserLink
                userId={review.author.id}
                name={review.author.name}
                avatarUrl={review.author.avatarUrl}
                showAvatar
              />
              <p className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <StarRow rating={review.rating} />
          </div>
          {review.comment && (
            <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{review.comment}</p>
          )}
        </SoftCard>
      ))}
    </div>
  );
}
