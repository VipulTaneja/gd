"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { DietaryPreference, DrinkingPreference } from "@/generated/prisma/enums";

export interface ProfileDemographics {
  bio: string;
  dietaryPreference: DietaryPreference | null;
  drinkingPreference: DrinkingPreference | null;
  likes: string;
  interests: string;
  avatarUrl: string | null;
}

export async function getProfileDemographics(): Promise<ProfileDemographics> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      bio: true,
      dietaryPreference: true,
      drinkingPreference: true,
      likes: true,
      interests: true,
      avatarUrl: true,
    },
  });

  return {
    bio: user.bio ?? "",
    dietaryPreference: user.dietaryPreference,
    drinkingPreference: user.drinkingPreference,
    likes: user.likes ?? "",
    interests: user.interests ?? "",
    avatarUrl: user.avatarUrl,
  };
}

export async function updateProfileDemographics(data: {
  bio?: string;
  dietaryPreference?: DietaryPreference | null;
  drinkingPreference?: DrinkingPreference | null;
  likes?: string;
  interests?: string;
  avatarUrl?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(data.bio !== undefined && { bio: data.bio || null }),
      ...(data.dietaryPreference !== undefined && { dietaryPreference: data.dietaryPreference }),
      ...(data.drinkingPreference !== undefined && { drinkingPreference: data.drinkingPreference }),
      ...(data.likes !== undefined && { likes: data.likes || null }),
      ...(data.interests !== undefined && { interests: data.interests || null }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
    },
  });

  revalidatePath("/profile");
}
