import type { PetGender, PetType, VehicleType } from "@/generated/prisma/enums";

export const petTypeLabels: Record<PetType, string> = {
  DOG: "Dog",
  CAT: "Cat",
  BIRD: "Bird",
  FISH: "Fish",
  OTHER: "Other",
};

export const petGenderLabels: Record<PetGender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  UNKNOWN: "Unknown",
};

export const vehicleTypeLabels: Record<VehicleType, string> = {
  CAR: "Car",
  SUV: "SUV",
  HATCHBACK: "Hatchback",
  SEDAN: "Sedan",
  MOTORCYCLE: "Motorcycle",
  SCOOTER: "Scooter",
  BICYCLE: "Bicycle",
  EV: "Electric vehicle",
  OTHER: "Other",
};

export const PET_TYPES = Object.keys(petTypeLabels) as PetType[];
export const PET_GENDERS = Object.keys(petGenderLabels) as PetGender[];
export const VEHICLE_TYPES = Object.keys(vehicleTypeLabels) as VehicleType[];
