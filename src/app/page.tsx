import { auth } from "@/lib/auth";
import { getHubData } from "@/lib/hub-data";
import { listActiveHubHeroSlides } from "@/lib/hub-hero";
import { canManageCommunityContent } from "@/lib/faq-auth";
import { CommunityHub } from "@/components/hub/community-hub";
import { HubHeader } from "@/components/hub/hub-header";
import { HubHero } from "@/components/hub/hub-hero";
import { HubShortcuts } from "@/components/hub/hub-shortcuts";
import { HubLiveFeed } from "@/components/hub/hub-live-feed";
import { HubCommunityPulse } from "@/components/hub/hub-community-pulse";
import { HubAmenityChips } from "@/components/hub/hub-amenity-chips";
import { HubFooter } from "@/components/hub/hub-footer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const isLeader = session?.user?.isLeader ?? false;
  const [hubData, heroSlides, canManageHero] = await Promise.all([
    getHubData(session?.user?.id),
    listActiveHubHeroSlides(),
    session?.user?.id ? canManageCommunityContent(session.user.id) : Promise.resolve(false),
  ]);

  return (
    <CommunityHub
      isAuthenticated={hubData.isResident}
      isLeader={isLeader}
      header={
        <HubHeader
          user={hubData.user}
          unreadCount={hubData.badges.unreadNotifications}
        />
      }
      hero={<HubHero user={hubData.user} slides={heroSlides} canManage={canManageHero} />}
      shortcuts={
        <HubShortcuts
          isAuthenticated={hubData.isResident}
          badges={hubData.badges}
          showFaq={hubData.showFaqShortcut}
        />
      }
      feed={
        <HubLiveFeed
          notices={hubData.notices}
          events={hubData.events}
          polls={hubData.polls}
          forumThreads={hubData.forumThreads}
        />
      }
      pulse={<HubCommunityPulse />}
      amenityChips={<HubAmenityChips facilities={hubData.facilities} />}
      footer={<HubFooter />}
    />
  );
}
