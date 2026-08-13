-- CreateEnum
CREATE TYPE "DietaryPreference" AS ENUM ('VEGETARIAN', 'VEGAN', 'NON_VEGETARIAN', 'JAIN', 'EGGETERIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "DrinkingPreference" AS ENUM ('NEVER', 'OCCASIONAL', 'SOCIAL', 'REGULAR', 'PREFER_NOT_TO_SAY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "dietaryPreference" "DietaryPreference",
ADD COLUMN     "drinkingPreference" "DrinkingPreference",
ADD COLUMN     "interests" TEXT,
ADD COLUMN     "likes" TEXT;
