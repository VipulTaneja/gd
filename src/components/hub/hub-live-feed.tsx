import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { SoftCard } from "@/components/shared/soft-card";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { FadeIn } from "@/components/shared/animated";
import { empty } from "@/lib/microcopy";
import { cn } from "@/lib/utils";
import { hubEventFallback } from "@/lib/hub-images";
import { featureColors, type FeatureKey } from "@/lib/feature-colors";
import type { HubNotice, HubEvent, HubPoll, HubForumThread } from "@/types/hub";

interface HubLiveFeedProps {
  notices: HubNotice[];
  events: HubEvent[];
  polls: HubPoll[];
  forumThreads: HubForumThread[];
}

const typeToFeature: Record<FeedItem["type"], FeatureKey> = {
  notice: "notices",
  event: "events",
  poll: "polls",
  forum: "forums",
};

const typeLabels: Record<FeedItem["type"], string> = {
  notice: "Notice",
  event: "Event",
  poll: "Poll",
  forum: "Forum",
};

const noticePriorityBorder: Record<string, string> = {
  EMERGENCY: "border-l-4 border-l-rose-500",
  IMPORTANT: "border-l-4 border-l-amber-500",
};

type FeedItem =
  | { type: "notice"; data: HubNotice; sortDate: Date }
  | { type: "event"; data: HubEvent; sortDate: Date }
  | { type: "poll"; data: HubPoll; sortDate: Date }
  | { type: "forum"; data: HubForumThread & { forumSlug: string }; sortDate: Date };

export function HubLiveFeed({ notices, events, polls, forumThreads }: HubLiveFeedProps) {
  const items: FeedItem[] = [
    ...notices.map((n) => ({
      type: "notice" as const,
      data: n,
      sortDate: new Date(n.publishedAt),
    })),
    ...events.map((e) => ({
      type: "event" as const,
      data: e,
      sortDate: new Date(e.startsAt),
    })),
    ...polls.map((p) => ({
      type: "poll" as const,
      data: p,
      sortDate: new Date(p.closesAt),
    })),
    ...forumThreads.map((t) => ({
      type: "forum" as const,
      data: t,
      sortDate: new Date(t.lastActivityAt),
    })),
  ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  if (items.length === 0) {
    return (
      <FadeIn>
        <SoftCard className="text-center py-8">
          <Sparkles className="mx-auto h-8 w-8 text-gold/60" />
          <p className="mt-3 text-sm font-medium">{empty.feed.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{empty.feed.description}</p>
        </SoftCard>
      </FadeIn>
    );
  }

  return (
    <FadeIn delay={100}>
      <SoftCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            What&apos;s happening
          </h3>
        </div>
        <div className="space-y-2">
          {items.slice(0, 6).map((item) => {
            const style = featureColors[typeToFeature[item.type]];
            const Icon = style.icon;
            const href =
              item.type === "poll"
                ? `/polls/${item.data.id}`
                : item.type === "event"
                  ? `/events`
                  : item.type === "forum"
                    ? `/forums/${item.data.forumSlug}/threads/${item.data.id}`
                    : `/notices`;

            const priorityBorder =
              item.type === "notice"
                ? noticePriorityBorder[item.data.priority]
                : undefined;

            return (
              <Link
                key={`${item.type}-${item.data.id}`}
                href={href}
                className={cn(
                  "flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted/60",
                  priorityBorder
                )}
              >
                {item.type === "event" ? (
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-foreground/5">
                    <Image
                      src={hubEventFallback.src}
                      alt={hubEventFallback.alt}
                      width={44}
                      height={44}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      style.bg
                    )}
                  >
                    <Icon className={cn("h-4 w-4", style.text)} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {typeLabels[item.type]}
                    </span>
                    {item.type === "notice" && (
                      <FriendlyBadge value={item.data.priority} variant="priority" />
                    )}
                  </div>
                  <p className="text-sm font-medium truncate mt-0.5">
                    {item.data.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.sortDate.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                    {item.type === "event" && item.data.location && ` · ${item.data.location}`}
                    {item.type === "poll" &&
                      ` · Closes ${new Date(item.data.closesAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                    {item.type === "forum" && ` · ${item.data._count.posts} replies`}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
              </Link>
            );
          })}
        </div>
        <div className="mt-3 flex gap-3 text-xs">
          <Link href="/notices" className="text-gold hover:underline">
            Notices →
          </Link>
          <Link href="/events" className="text-gold hover:underline">
            Events →
          </Link>
          <Link href="/polls" className="text-gold hover:underline">
            Polls →
          </Link>
          <Link href="/forums" className="text-gold hover:underline">
            Forums →
          </Link>
        </div>
      </SoftCard>
    </FadeIn>
  );
}
