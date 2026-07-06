import { auth } from "@/lib/auth";
import { getHubData } from "@/lib/hub-data";
import { CommunityHub } from "@/components/hub/community-hub";
import { HubHeader } from "@/components/hub/hub-header";
import { HubGreeting } from "@/components/hub/hub-greeting";
import { HubShortcuts } from "@/components/hub/hub-shortcuts";
import { HubLiveFeed } from "@/components/hub/hub-live-feed";
import { HubCommunityPulse } from "@/components/hub/hub-community-pulse";
import { HubAmenityChips } from "@/components/hub/hub-amenity-chips";
import { HubFooter } from "@/components/hub/hub-footer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const hubData = await getHubData(session?.user?.id);

  return (
    <CommunityHub
      isAuthenticated={hubData.isResident}
      header={
        <HubHeader
          user={hubData.user}
          unreadCount={hubData.badges.unreadNotifications}
        />
      }
      greeting={<HubGreeting user={hubData.user} />}
      shortcuts={
        <HubShortcuts
          isAuthenticated={hubData.isResident}
          badges={hubData.badges}
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
