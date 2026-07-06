-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'RESIDENT', 'NON_RESIDENT', 'SECURITY_STAFF');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('APARTMENT', 'DUPLEX', 'VILLA', 'SHOP', 'OFFICE');

-- CreateEnum
CREATE TYPE "UnitRole" AS ENUM ('OWNER', 'JOINT_OWNER', 'TENANT', 'OWNER_FAMILY', 'TENANT_FAMILY');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'GRANTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "MembershipRequestType" AS ENUM ('LEADER_INVITE', 'ADMIN_INVITE', 'CLAIM');

-- CreateEnum
CREATE TYPE "MembershipRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CommunityRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PollScope" AS ENUM ('GLOBAL', 'SUB_COMMUNITY');

-- CreateEnum
CREATE TYPE "ResultVisibility" AS ENUM ('LIVE', 'AFTER_CLOSE');

-- CreateEnum
CREATE TYPE "PollEligibility" AS ENUM ('ALL_RESIDENTS', 'OWNERS_ONLY', 'ONE_PER_UNIT');

-- CreateEnum
CREATE TYPE "EventScope" AS ENUM ('GLOBAL', 'SUB_COMMUNITY');

-- CreateEnum
CREATE TYPE "RSVPStatus" AS ENUM ('ACCEPTED', 'DECLINED', 'MAYBE');

-- CreateEnum
CREATE TYPE "DomesticHelpStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "VisitorType" AS ENUM ('GUEST', 'DELIVERY', 'DAILY_HELP', 'CAB', 'OTHER');

-- CreateEnum
CREATE TYPE "PassStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('PLUMBING', 'ELECTRICAL', 'CIVIL', 'HOUSEKEEPING', 'SECURITY', 'OTHER');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_APPROVAL', 'CONFIRMED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MoveType" AS ENUM ('MOVE_IN', 'MOVE_OUT');

-- CreateEnum
CREATE TYPE "MoveStatus" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NoticePriority" AS ENUM ('NORMAL', 'IMPORTANT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "DueStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'WAIVED');

-- CreateEnum
CREATE TYPE "PetType" AS ENUM ('DOG', 'CAT', 'BIRD', 'FISH', 'OTHER');

-- CreateEnum
CREATE TYPE "PetGender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'SUV', 'HATCHBACK', 'SEDAN', 'MOTORCYCLE', 'SCOOTER', 'BICYCLE', 'EV', 'OTHER');

-- CreateEnum
CREATE TYPE "LostFoundType" AS ENUM ('LOST', 'FOUND');

-- CreateEnum
CREATE TYPE "LostFoundStatus" AS ENUM ('ACTIVE', 'CLAIMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPROVAL_GRANTED', 'APPROVAL_REJECTED', 'NEW_POLL', 'POLL_CLOSED', 'NEW_EVENT', 'EVENT_REMINDER', 'TICKET_UPDATE', 'VISITOR_ARRIVED', 'DUE_REMINDER', 'NOTICE_PUBLISHED', 'COMMUNITY_JOIN_APPROVED', 'FORUM_REPLY', 'FORUM_MODERATION', 'UNIT_INVITE', 'UNIT_INVITE_ACCEPTED', 'BOOKING_APPROVED', 'BOOKING_REJECTED', 'GENERAL');

-- CreateEnum
CREATE TYPE "ForumScope" AS ENUM ('GLOBAL', 'SUB_COMMUNITY');

-- CreateEnum
CREATE TYPE "ForumThreadStatus" AS ENUM ('OPEN', 'LOCKED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ForumReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "organization" TEXT,
    "avatarUrl" TEXT,
    "globalRole" "GlobalRole" NOT NULL DEFAULT 'RESIDENT',
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "termsAcceptedAt" TIMESTAMP(3),
    "claimedUnitId" TEXT,
    "claimStatus" "ClaimStatus",
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "vehiclePlates" TEXT[],
    "allowDeliveriesToday" BOOLEAN NOT NULL DEFAULT false,
    "notificationPrefs" JSONB,
    "staffPin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "block" TEXT NOT NULL,
    "floor" INTEGER,
    "unitType" "UnitType" NOT NULL DEFAULT 'APARTMENT',
    "areaSqFt" DOUBLE PRECISION DEFAULT 2783,
    "parkingSlots" INTEGER NOT NULL DEFAULT 2,
    "leaderUserId" TEXT,
    "leaderAssignedAt" TIMESTAMP(3),
    "leaderAssignedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "role" "UnitRole" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "ownerConsent" "ConsentStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitMembershipRequest" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedRole" "UnitRole" NOT NULL,
    "type" "MembershipRequestType" NOT NULL,
    "status" "MembershipRequestStatus" NOT NULL DEFAULT 'PENDING',
    "invitedById" TEXT,
    "ownerConsent" "ConsentStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "expiresAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitMembershipRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubCommunity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "targetBlock" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubCommunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subCommunityId" TEXT NOT NULL,
    "role" "CommunityRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityJoinRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subCommunityId" TEXT NOT NULL,
    "status" "JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "CommunityJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scope" "PollScope" NOT NULL,
    "subCommunityId" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "resultVisibility" "ResultVisibility" NOT NULL DEFAULT 'LIVE',
    "maxChoices" INTEGER NOT NULL DEFAULT 1,
    "eligibility" "PollEligibility" NOT NULL DEFAULT 'ALL_RESIDENTS',
    "isResolution" BOOLEAN NOT NULL DEFAULT false,
    "quorumPercentage" INTEGER,
    "opensAt" TIMESTAMP(3) NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollOption" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollProxy" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "proxyUserId" TEXT NOT NULL,
    "targetUnitId" TEXT NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PollProxy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "scope" "EventScope" NOT NULL,
    "subCommunityId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "maxAttendees" INTEGER,
    "facilityId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RSVP" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RSVPStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RSVP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileEntry" (
    "id" TEXT NOT NULL,
    "subCommunityId" TEXT,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomesticHelp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "photoUrl" TEXT,
    "helpType" TEXT NOT NULL DEFAULT 'OTHER',
    "recurrenceDays" TEXT[],
    "status" "DomesticHelpStatus" NOT NULL DEFAULT 'ACTIVE',
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomesticHelp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorPass" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "visitorPhone" TEXT,
    "visitorType" "VisitorType" NOT NULL,
    "otp" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "status" "PassStatus" NOT NULL DEFAULT 'ACTIVE',
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceDays" TEXT[],
    "parkingSlot" TEXT,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitorPass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpTicket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unitId" TEXT,
    "category" "TicketCategory" NOT NULL,
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "assignedToUserId" TEXT,
    "assignedToCommunityId" TEXT,
    "satisfactionRating" INTEGER,
    "satisfactionComment" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketComment" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketAttachment" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "slotMinutes" INTEGER NOT NULL DEFAULT 60,
    "maxAdvDays" INTEGER NOT NULL DEFAULT 7,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "maxBookingsPerUser" INTEGER NOT NULL DEFAULT 2,
    "minCancelMinutes" INTEGER NOT NULL DEFAULT 60,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityLeader" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT,

    CONSTRAINT "FacilityLeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityBooking" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacilityBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityBlackout" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacilityBlackout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityWaitlist" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacilityWaitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoveRequest" (
    "id" TEXT NOT NULL,
    "type" "MoveType" NOT NULL,
    "unitId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" "MoveStatus" NOT NULL DEFAULT 'PENDING',
    "checklist" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "priority" "NoticePriority" NOT NULL DEFAULT 'NORMAL',
    "targetBlock" TEXT,
    "subCommunityId" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoticeAcknowledgment" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ackAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoticeAcknowledgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoticeRead" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoticeRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Due" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "DueStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Due_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DueLineItem" (
    "id" TEXT NOT NULL,
    "dueId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "DueLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "petType" "PetType" NOT NULL DEFAULT 'DOG',
    "breed" TEXT,
    "color" TEXT,
    "ageYears" INTEGER,
    "gender" "PetGender" NOT NULL DEFAULT 'UNKNOWN',
    "photoUrl" TEXT,
    "vaccinationExpiry" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "registeredByUserId" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL DEFAULT 'CAR',
    "registrationNumber" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostFoundItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "LostFoundType" NOT NULL,
    "location" TEXT,
    "imageUrl" TEXT,
    "status" "LostFoundStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LostFoundItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Designation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forum" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" "ForumScope" NOT NULL DEFAULT 'GLOBAL',
    "subCommunityId" TEXT,
    "isReadOnly" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Forum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumThread" (
    "id" TEXT NOT NULL,
    "forumId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ForumThreadStatus" NOT NULL DEFAULT 'OPEN',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumPost" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "images" JSONB,
    "replyToPostId" TEXT,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumReport" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ForumReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ForumReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumReaction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportantContact" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "typeOfService" TEXT NOT NULL,
    "name" TEXT,
    "contactNo" TEXT NOT NULL,
    "remarks" TEXT,
    "lastEditedById" TEXT,
    "lastEditedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportantContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_unitNumber_key" ON "Unit"("unitNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_leaderUserId_key" ON "Unit"("leaderUserId");

-- CreateIndex
CREATE INDEX "UnitMembership_unitId_endDate_idx" ON "UnitMembership"("unitId", "endDate");

-- CreateIndex
CREATE INDEX "UnitMembership_userId_endDate_idx" ON "UnitMembership"("userId", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "UnitMembership_userId_unitId_role_startDate_key" ON "UnitMembership"("userId", "unitId", "role", "startDate");

-- CreateIndex
CREATE INDEX "UnitMembershipRequest_unitId_status_idx" ON "UnitMembershipRequest"("unitId", "status");

-- CreateIndex
CREATE INDEX "UnitMembershipRequest_userId_status_idx" ON "UnitMembershipRequest"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SubCommunity_name_key" ON "SubCommunity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubCommunity_targetBlock_key" ON "SubCommunity"("targetBlock");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityMembership_userId_subCommunityId_key" ON "CommunityMembership"("userId", "subCommunityId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityJoinRequest_userId_subCommunityId_status_key" ON "CommunityJoinRequest"("userId", "subCommunityId", "status");

-- CreateIndex
CREATE INDEX "Vote_pollId_userId_idx" ON "Vote"("pollId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_pollId_optionId_userId_key" ON "Vote"("pollId", "optionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PollProxy_pollId_targetUnitId_key" ON "PollProxy"("pollId", "targetUnitId");

-- CreateIndex
CREATE INDEX "Event_facilityId_idx" ON "Event"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "RSVP_eventId_userId_key" ON "RSVP"("eventId", "userId");

-- CreateIndex
CREATE INDEX "DomesticHelp_unitId_status_idx" ON "DomesticHelp"("unitId", "status");

-- CreateIndex
CREATE INDEX "DomesticHelp_userId_status_idx" ON "DomesticHelp"("userId", "status");

-- CreateIndex
CREATE INDEX "VisitorPass_unitId_status_idx" ON "VisitorPass"("unitId", "status");

-- CreateIndex
CREATE INDEX "VisitorPass_otp_status_idx" ON "VisitorPass"("otp", "status");

-- CreateIndex
CREATE INDEX "HelpTicket_status_createdAt_idx" ON "HelpTicket"("status", "createdAt");

-- CreateIndex
CREATE INDEX "HelpTicket_assignedToUserId_idx" ON "HelpTicket"("assignedToUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_name_key" ON "Facility"("name");

-- CreateIndex
CREATE INDEX "FacilityLeader_userId_idx" ON "FacilityLeader"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityLeader_facilityId_userId_key" ON "FacilityLeader"("facilityId", "userId");

-- CreateIndex
CREATE INDEX "FacilityBooking_facilityId_startsAt_endsAt_idx" ON "FacilityBooking"("facilityId", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "FacilityBooking_userId_startsAt_idx" ON "FacilityBooking"("userId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityBooking_facilityId_startsAt_key" ON "FacilityBooking"("facilityId", "startsAt");

-- CreateIndex
CREATE INDEX "FacilityBlackout_facilityId_startsAt_endsAt_idx" ON "FacilityBlackout"("facilityId", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "FacilityWaitlist_facilityId_status_idx" ON "FacilityWaitlist"("facilityId", "status");

-- CreateIndex
CREATE INDEX "MoveRequest_unitId_status_idx" ON "MoveRequest"("unitId", "status");

-- CreateIndex
CREATE INDEX "MoveRequest_requestedBy_status_idx" ON "MoveRequest"("requestedBy", "status");

-- CreateIndex
CREATE INDEX "Notice_subCommunityId_idx" ON "Notice"("subCommunityId");

-- CreateIndex
CREATE UNIQUE INDEX "NoticeAcknowledgment_noticeId_userId_key" ON "NoticeAcknowledgment"("noticeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "NoticeRead_noticeId_userId_key" ON "NoticeRead"("noticeId", "userId");

-- CreateIndex
CREATE INDEX "Pet_unitId_idx" ON "Pet"("unitId");

-- CreateIndex
CREATE INDEX "Vehicle_unitId_idx" ON "Vehicle"("unitId");

-- CreateIndex
CREATE INDEX "Vehicle_registrationNumber_idx" ON "Vehicle"("registrationNumber");

-- CreateIndex
CREATE INDEX "LostFoundItem_type_status_idx" ON "LostFoundItem"("type", "status");

-- CreateIndex
CREATE INDEX "LostFoundItem_status_expiresAt_idx" ON "LostFoundItem"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "Designation_userId_endDate_idx" ON "Designation"("userId", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Forum_slug_key" ON "Forum"("slug");

-- CreateIndex
CREATE INDEX "Forum_scope_sortOrder_idx" ON "Forum"("scope", "sortOrder");

-- CreateIndex
CREATE INDEX "ForumThread_forumId_lastActivityAt_idx" ON "ForumThread"("forumId", "lastActivityAt" DESC);

-- CreateIndex
CREATE INDEX "ForumThread_authorId_idx" ON "ForumThread"("authorId");

-- CreateIndex
CREATE INDEX "ForumPost_threadId_createdAt_idx" ON "ForumPost"("threadId", "createdAt" ASC);

-- CreateIndex
CREATE INDEX "ForumPost_authorId_idx" ON "ForumPost"("authorId");

-- CreateIndex
CREATE INDEX "ForumReport_status_createdAt_idx" ON "ForumReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ForumSubscription_threadId_idx" ON "ForumSubscription"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "ForumSubscription_userId_threadId_key" ON "ForumSubscription"("userId", "threadId");

-- CreateIndex
CREATE INDEX "ForumReaction_postId_idx" ON "ForumReaction"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "ForumReaction_postId_userId_emoji_key" ON "ForumReaction"("postId", "userId", "emoji");

-- CreateIndex
CREATE INDEX "ImportantContact_category_idx" ON "ImportantContact"("category");

-- CreateIndex
CREATE INDEX "ImportantContact_lastEditedAt_idx" ON "ImportantContact"("lastEditedAt" DESC);

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_leaderUserId_fkey" FOREIGN KEY ("leaderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_leaderAssignedById_fkey" FOREIGN KEY ("leaderAssignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitMembership" ADD CONSTRAINT "UnitMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitMembership" ADD CONSTRAINT "UnitMembership_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitMembershipRequest" ADD CONSTRAINT "UnitMembershipRequest_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitMembershipRequest" ADD CONSTRAINT "UnitMembershipRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitMembershipRequest" ADD CONSTRAINT "UnitMembershipRequest_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMembership" ADD CONSTRAINT "CommunityMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMembership" ADD CONSTRAINT "CommunityMembership_subCommunityId_fkey" FOREIGN KEY ("subCommunityId") REFERENCES "SubCommunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityJoinRequest" ADD CONSTRAINT "CommunityJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityJoinRequest" ADD CONSTRAINT "CommunityJoinRequest_subCommunityId_fkey" FOREIGN KEY ("subCommunityId") REFERENCES "SubCommunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_subCommunityId_fkey" FOREIGN KEY ("subCommunityId") REFERENCES "SubCommunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PollOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollProxy" ADD CONSTRAINT "PollProxy_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollProxy" ADD CONSTRAINT "PollProxy_proxyUserId_fkey" FOREIGN KEY ("proxyUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollProxy" ADD CONSTRAINT "PollProxy_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_subCommunityId_fkey" FOREIGN KEY ("subCommunityId") REFERENCES "SubCommunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileEntry" ADD CONSTRAINT "FileEntry_subCommunityId_fkey" FOREIGN KEY ("subCommunityId") REFERENCES "SubCommunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomesticHelp" ADD CONSTRAINT "DomesticHelp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomesticHelp" ADD CONSTRAINT "DomesticHelp_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomesticHelp" ADD CONSTRAINT "DomesticHelp_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorPass" ADD CONSTRAINT "VisitorPass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorPass" ADD CONSTRAINT "VisitorPass_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_assignedToCommunityId_fkey" FOREIGN KEY ("assignedToCommunityId") REFERENCES "SubCommunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "HelpTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketAttachment" ADD CONSTRAINT "TicketAttachment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "HelpTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityLeader" ADD CONSTRAINT "FacilityLeader_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityLeader" ADD CONSTRAINT "FacilityLeader_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityLeader" ADD CONSTRAINT "FacilityLeader_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityBooking" ADD CONSTRAINT "FacilityBooking_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityBooking" ADD CONSTRAINT "FacilityBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityBooking" ADD CONSTRAINT "FacilityBooking_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityBlackout" ADD CONSTRAINT "FacilityBlackout_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityWaitlist" ADD CONSTRAINT "FacilityWaitlist_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityWaitlist" ADD CONSTRAINT "FacilityWaitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoveRequest" ADD CONSTRAINT "MoveRequest_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoveRequest" ADD CONSTRAINT "MoveRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_subCommunityId_fkey" FOREIGN KEY ("subCommunityId") REFERENCES "SubCommunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoticeAcknowledgment" ADD CONSTRAINT "NoticeAcknowledgment_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "Notice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoticeRead" ADD CONSTRAINT "NoticeRead_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "Notice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Due" ADD CONSTRAINT "Due_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DueLineItem" ADD CONSTRAINT "DueLineItem_dueId_fkey" FOREIGN KEY ("dueId") REFERENCES "Due"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_registeredByUserId_fkey" FOREIGN KEY ("registeredByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostFoundItem" ADD CONSTRAINT "LostFoundItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Designation" ADD CONSTRAINT "Designation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forum" ADD CONSTRAINT "Forum_subCommunityId_fkey" FOREIGN KEY ("subCommunityId") REFERENCES "SubCommunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumThread" ADD CONSTRAINT "ForumThread_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "Forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumThread" ADD CONSTRAINT "ForumThread_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ForumThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReport" ADD CONSTRAINT "ForumReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReport" ADD CONSTRAINT "ForumReport_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReport" ADD CONSTRAINT "ForumReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumSubscription" ADD CONSTRAINT "ForumSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumSubscription" ADD CONSTRAINT "ForumSubscription_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ForumThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReaction" ADD CONSTRAINT "ForumReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReaction" ADD CONSTRAINT "ForumReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportantContact" ADD CONSTRAINT "ImportantContact_lastEditedById_fkey" FOREIGN KEY ("lastEditedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
