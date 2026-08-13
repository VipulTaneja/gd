"use client";

import { useState, useRef, useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import {
  updateProfileDemographics,
  type ProfileDemographics,
} from "@/app/profile/demographics-actions";

const DIETARY_OPTIONS = [
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "VEGAN", label: "Vegan" },
  { value: "NON_VEGETARIAN", label: "Non-Vegetarian" },
  { value: "JAIN", label: "Jain" },
  { value: "EGGETERIAN", label: "Eggetarian" },
  { value: "OTHER", label: "Other" },
] as const;

const DRINKING_OPTIONS = [
  { value: "NEVER", label: "Never" },
  { value: "OCCASIONAL", label: "Occasional" },
  { value: "SOCIAL", label: "Social" },
  { value: "REGULAR", label: "Regular" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
] as const;

interface DemographicsEditorProps {
  initial: ProfileDemographics;
}

export function DemographicsEditor({ initial }: DemographicsEditorProps) {
  const [bio, setBio] = useState(initial.bio);
  const [dietaryPreference, setDietaryPreference] = useState(initial.dietaryPreference);
  const [drinkingPreference, setDrinkingPreference] = useState(initial.drinkingPreference);
  const [likes, setLikes] = useState(initial.likes);
  const [interests, setInterests] = useState(initial.interests);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [saving, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasChanges =
    bio !== initial.bio ||
    dietaryPreference !== initial.dietaryPreference ||
    drinkingPreference !== initial.drinkingPreference ||
    likes !== initial.likes ||
    interests !== initial.interests ||
    avatarUrl !== initial.avatarUrl;

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    startTransition(async () => {
      await updateProfileDemographics({
        bio,
        dietaryPreference,
        drinkingPreference,
        likes,
        interests,
        avatarUrl,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-6">
      {/* Photo */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative group"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile photo"
              className="h-20 w-20 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-gold text-2xl font-bold">
              C
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-5 w-5 text-white" />
          </div>
        </button>
        <div>
          <p className="text-sm font-medium">Profile Photo</p>
          <p className="text-xs text-muted-foreground">Click to upload or change</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="text-sm font-medium">About Me</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="A little about yourself — your profession, what you love about the community, or anything you'd like neighbours to know."
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 min-h-[80px]"
        />
      </div>

      {/* Dietary & Drinking */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Dietary Preference</label>
          <select
            value={dietaryPreference ?? ""}
            onChange={(e) => setDietaryPreference((e.target.value || null) as any)}
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 min-h-11"
          >
            <option value="">Not specified</option>
            {DIETARY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Drinking Preference</label>
          <select
            value={drinkingPreference ?? ""}
            onChange={(e) => setDrinkingPreference((e.target.value || null) as any)}
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 min-h-11"
          >
            <option value="">Not specified</option>
            {DRINKING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Likes */}
      <div>
        <label htmlFor="likes" className="text-sm font-medium">Likes</label>
        <input
          id="likes"
          value={likes}
          onChange={(e) => setLikes(e.target.value)}
          placeholder="e.g. Cooking, Cricket, Board games, Chai walks"
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 min-h-11"
        />
        <p className="mt-1 text-xs text-muted-foreground">Comma-separated list</p>
      </div>

      {/* Interests */}
      <div>
        <label htmlFor="interests" className="text-sm font-medium">Interests</label>
        <input
          id="interests"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="e.g. Sustainable living, Tech, Photography, Reading"
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 min-h-11"
        />
        <p className="mt-1 text-xs text-muted-foreground">Comma-separated list</p>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="min-h-11"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
        </Button>
        {saved && <FriendlyBadge value="SAVED" variant="semantic" />}
      </div>
    </div>
  );
}
