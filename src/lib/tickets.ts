export const TICKET_SLA_HOURS: Record<string, number> = {
  URGENT: 4,
  HIGH: 24,
  MEDIUM: 48,
  LOW: 72,
};

export function getSLADeadline(createdAt: Date, priority: string): Date {
  const hours = TICKET_SLA_HOURS[priority] ?? 48;
  return new Date(createdAt.getTime() + hours * 60 * 60 * 1000);
}

export function isSLABreached(createdAt: Date, priority: string): boolean {
  return new Date() > getSLADeadline(createdAt, priority);
}

export function getSLAStatus(createdAt: Date, priority: string): "ok" | "warning" | "breached" {
  const deadline = getSLADeadline(createdAt, priority);
  const now = new Date();
  const remaining = deadline.getTime() - now.getTime();
  const hoursLeft = remaining / (1000 * 60 * 60);

  if (hoursLeft <= 0) return "breached";
  if (hoursLeft <= 4) return "warning";
  return "ok";
}
