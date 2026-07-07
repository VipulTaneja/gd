import { canManageFaq } from "@/lib/faq-auth";

/** Same editors as FAQ: Admin, Super Admin, or active committee designation. */
export async function canManageHubHero(userId: string): Promise<boolean> {
  return canManageFaq(userId);
}
