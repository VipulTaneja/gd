"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Home, Users, Briefcase } from "lucide-react";
import { FadeIn, StaggerChildren } from "@/components/shared/animated";

interface Member {
  name: string;
  role: string;
  photo: string;
  unit?: string;
  interests?: string[];
  family?: string;
  likes?: string[];
  email?: string;
}

const members: Member[] = [
  {
    name: "Naveen Aggarwal",
    role: "President",
    photo: "/gdwa/Naveen Aggarwal - President.png",
    unit: "Tower A",
    interests: ["Community Development", "Governance"],
    family: "Resident since 2020",
    likes: ["Reading", "Travel"],
  },
  {
    name: "Nitin Gupta",
    role: "Vice President",
    photo: "/gdwa/Nitin Gupta - Vice President.png",
    unit: "Tower B",
    interests: ["Infrastructure", "Planning"],
    family: "Resident since 2021",
    likes: ["Cricket", "Music"],
  },
  {
    name: "Jitender Goel",
    role: "Secretary",
    photo: "/gdwa/Jitender Goel - Secretary.png",
    unit: "Tower C",
    interests: ["Administration", "Communication"],
    family: "Resident since 2019",
    likes: ["Photography", "Gardening"],
  },
  {
    name: "Mohit Chhajer",
    role: "Joint Secretary",
    photo: "/gdwa/Mohit Chhajer - Joint Secretary.png",
    unit: "Tower A",
    interests: ["Events", "Coordination"],
    family: "Resident since 2021",
    likes: ["Cooking", "Yoga"],
  },
  {
    name: "Manoj Sharma",
    role: "Treasurer",
    photo: "/gdwa/Manoj Sharma - Treasurer.png",
    unit: "Tower B",
    interests: ["Finance", "Accounts"],
    family: "Resident since 2020",
    likes: ["Chess", "Walking"],
  },
  {
    name: "Sumit Tayal",
    role: "MC Member",
    photo: "/gdwa/Sumit Tayal - MC-05.png",
    unit: "Tower C",
    interests: ["Maintenance", "Safety"],
    family: "Resident since 2021",
    likes: ["Gym", "Badminton"],
  },
  {
    name: "Rajiv Chopra",
    role: "MC Member",
    photo: "/gdwa/Rajiv Chopra - MC-06.png",
    unit: "Tower A",
    interests: ["Landscaping", "Environment"],
    family: "Resident since 2020",
    likes: ["Hiking", "Photography"],
  },
  {
    name: "Mukesh Singla",
    role: "MC Member",
    photo: "/gdwa/Mukesh Singla - MC-07.png",
    unit: "Tower B",
    interests: ["Security", "Operations"],
    family: "Resident since 2021",
    likes: ["Chess", "Reading"],
  },
  {
    name: "Ravindra Jain",
    role: "MC Member",
    photo: "/gdwa/Ravindra Jain - MC-08.png",
    unit: "Tower C",
    interests: ["Legal", "Compliance"],
    family: "Resident since 2019",
    likes: ["Law", "Travel"],
  },
  {
    name: "Bhanu Binani",
    role: "MC Member",
    photo: "/gdwa/Bhanu Binani - MC-09.png",
    unit: "Tower A",
    interests: ["Events", "Community"],
    family: "Resident since 2020",
    likes: ["Dancing", "Cooking"],
  },
  {
    name: "Ashish Saini",
    role: "MC Member",
    photo: "/gdwa/Ashish Saini - MC-10.png",
    unit: "Tower B",
    interests: ["Technology", "Innovation"],
    family: "Resident since 2021",
    likes: ["Gadgets", "Gaming"],
  },
  {
    name: "Mohit Kalra",
    role: "MC Member",
    photo: "/gdwa/Mohit Kalra - MC-11.png",
    unit: "Tower C",
    interests: ["Sports", "Fitness"],
    family: "Resident since 2020",
    likes: ["Cricket", "Gym"],
  },
  {
    name: "Deepak Sapra",
    role: "MC Member",
    photo: "/gdwa/Deepak Sapra - MC-13.png",
    unit: "Tower A",
    interests: ["Amenities", "Recreation"],
    family: "Resident since 2021",
    likes: ["Swimming", "Tennis"],
  },
  {
    name: "Rajneesh Mathur",
    role: "MC Member",
    photo: "/gdwa/Rajneesh Mathur - MC-15.png",
    unit: "Tower B",
    interests: ["Green Initiatives", "Sustainability"],
    family: "Resident since 2020",
    likes: ["Gardening", "Yoga"],
  },
  {
    name: "Manoj Bansal",
    role: "MC Member",
    photo: "/gdwa/Manoj Bansal - MC-17.png",
    unit: "Tower C",
    interests: ["Parking", "Vehicles"],
    family: "Resident since 2021",
    likes: ["Cars", "Travel"],
  },
  {
    name: "Rajesh K Mishra",
    role: "MC Member",
    photo: "/gdwa/Rajesh K Mishra - MC-18.png",
    unit: "Tower A",
    interests: ["Cultural Events", "Festivals"],
    family: "Resident since 2020",
    likes: ["Music", "Dancing"],
  },
  {
    name: "Rajesh Gupta",
    role: "MC Member",
    photo: "/gdwa/Rajesh Gupta - MC-19.png",
    unit: "Tower B",
    interests: ["Health", "Wellness"],
    family: "Resident since 2021",
    likes: ["Walking", "Meditation"],
  },
  {
    name: "Meenal Kumar",
    role: "MC Member",
    photo: "/gdwa/Meenal Kumar - MC-20.png",
    unit: "Tower C",
    interests: ["Women Safety", "Community"],
    family: "Resident since 2020",
    likes: ["Yoga", "Reading"],
  },
  {
    name: "Naman Gupta",
    role: "MC Member",
    photo: "/gdwa/Naman Gupta - MC-23.png",
    unit: "Tower A",
    interests: ["Youth Activities", "Sports"],
    family: "Resident since 2021",
    likes: ["Cricket", "Football"],
  },
  {
    name: "Anu Nagpal",
    role: "MC Member",
    photo: "/gdwa/Anu Nagpal.png",
    unit: "Tower B",
    interests: ["Decor", "Community"],
    family: "Resident since 2020",
    likes: ["Art", "Cooking"],
  },
];

const roleColors: Record<string, string> = {
  President: "from-amber-500 to-orange-600",
  "Vice President": "from-amber-400 to-yellow-500",
  Secretary: "from-emerald-500 to-teal-600",
  "Joint Secretary": "from-emerald-400 to-green-500",
  Treasurer: "from-sky-500 to-blue-600",
  "MC Member": "from-violet-400 to-purple-500",
};

const roleBadgeColors: Record<string, string> = {
  President: "bg-amber-100 text-amber-800",
  "Vice President": "bg-yellow-100 text-yellow-800",
  Secretary: "bg-emerald-100 text-emerald-800",
  "Joint Secretary": "bg-green-100 text-green-800",
  Treasurer: "bg-sky-100 text-sky-800",
  "MC Member": "bg-violet-100 text-violet-800",
};

export default function TeamPage() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const officeBearers = members.filter((m) => !m.role.includes("MC"));
  const mcMembers = members.filter((m) => m.role.includes("MC"));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-gold/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <span className="text-sm font-medium text-gold">GDWA Team</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <FadeIn>
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-2 text-sm font-medium text-gold mb-6">
              <Users className="h-4 w-4" />
              Gulshan Dynasty Welfare Association
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Meet Our <span className="text-gold">Team</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Dedicated residents working together to make Gulshan Dynasty the best place to call home.
            </p>
          </div>
        </FadeIn>

        {/* Office Bearers */}
        <FadeIn delay={100}>
          <div className="mb-12">
            <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-gold" />
              Office Bearers
            </h2>
            <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {officeBearers.map((member) => (
                <MemberCard
                  key={member.name}
                  member={member}
                  onClick={() => setSelectedMember(member)}
                />
              ))}
            </StaggerChildren>
          </div>
        </FadeIn>

        {/* MC Members */}
        <FadeIn delay={200}>
          <div>
            <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-gold" />
              Management Committee Members
            </h2>
            <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {mcMembers.map((member) => (
                <MemberCard
                  key={member.name}
                  member={member}
                  onClick={() => setSelectedMember(member)}
                />
              ))}
            </StaggerChildren>
          </div>
        </FadeIn>
      </main>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`relative h-32 bg-gradient-to-br ${roleColors[selectedMember.role] || roleColors["MC Member"]}`}>
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                ✕
              </button>
              <div className="absolute -bottom-12 left-6">
                <div className="relative h-24 w-24 rounded-2xl border-4 border-card overflow-hidden shadow-lg">
                  <Image
                    src={selectedMember.photo}
                    alt={selectedMember.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="pt-16 px-6 pb-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading text-xl font-bold">{selectedMember.name}</h3>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeColors[selectedMember.role] || roleBadgeColors["MC Member"]}`}>
                    {selectedMember.role}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {selectedMember.unit && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10">
                      <Home className="h-4 w-4 text-gold" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Unit</p>
                      <p className="font-medium">{selectedMember.unit}</p>
                    </div>
                  </div>
                )}

                {selectedMember.family && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100">
                      <Heart className="h-4 w-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Family</p>
                      <p className="font-medium">{selectedMember.family}</p>
                    </div>
                  </div>
                )}

                {selectedMember.interests && selectedMember.interests.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Interests</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMember.interests.map((interest) => (
                        <span key={interest} className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMember.likes && selectedMember.likes.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Likes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMember.likes.map((like) => (
                        <span key={like} className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold-dark">
                          <Heart className="h-3 w-3" />
                          {like}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MemberCard({ member, onClick }: { member: Member; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl border bg-card p-4 text-left transition-all hover:ring-gold hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden">
          <Image
            src={member.photo}
            alt={member.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-sm font-semibold truncate group-hover:text-gold transition-colors">
            {member.name}
          </h3>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium mt-1 ${roleBadgeColors[member.role] || roleBadgeColors["MC Member"]}`}>
            {member.role}
          </span>
          {member.unit && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Home className="h-3 w-3" />
              {member.unit}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
