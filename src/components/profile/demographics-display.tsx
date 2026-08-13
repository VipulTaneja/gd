import { Heart, Wine, Utensils, Sparkles } from "lucide-react";
import { FriendlyBadge } from "@/components/shared/friendly-badge";

interface DemographicsDisplayProps {
  bio: string | null;
  dietaryPreference: string | null;
  drinkingPreference: string | null;
  likes: string | null;
  interests: string | null;
}

function TagList({ items }: { items: string }) {
  const tags = items.split(",").map((t) => t.trim()).filter(Boolean);
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

const DIETARY_LABELS: Record<string, string> = {
  VEGETARIAN: "Vegetarian",
  VEGAN: "Vegan",
  NON_VEGETARIAN: "Non-Vegetarian",
  JAIN: "Jain",
  EGGETERIAN: "Eggetarian",
  OTHER: "Other",
};

const DRINKING_LABELS: Record<string, string> = {
  NEVER: "Never",
  OCCASIONAL: "Occasional",
  SOCIAL: "Social",
  REGULAR: "Regular",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

export function DemographicsDisplay({
  bio,
  dietaryPreference,
  drinkingPreference,
  likes,
  interests,
}: DemographicsDisplayProps) {
  const hasAny =
    bio || dietaryPreference || drinkingPreference || likes || interests;

  if (!hasAny) return null;

  return (
    <div className="space-y-4">
      {bio && (
        <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
      )}

      <div className="flex flex-wrap gap-4 text-sm">
        {dietaryPreference && (
          <div className="flex items-center gap-1.5">
            <Utensils className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{DIETARY_LABELS[dietaryPreference] ?? dietaryPreference}</span>
          </div>
        )}
        {drinkingPreference && drinkingPreference !== "PREFER_NOT_TO_SAY" && (
          <div className="flex items-center gap-1.5">
            <Wine className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{DRINKING_LABELS[drinkingPreference] ?? drinkingPreference}</span>
          </div>
        )}
      </div>

      {likes && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Likes</span>
          </div>
          <TagList items={likes} />
        </div>
      )}

      {interests && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Interests</span>
          </div>
          <TagList items={interests} />
        </div>
      )}
    </div>
  );
}
