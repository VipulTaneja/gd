import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Email from "next-auth/providers/email";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";

const providers: Provider[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
  providers.push(
    Apple({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    })
  );
}

if (process.env.RESEND_API_KEY) {
  providers.push(
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "noreply@gulshandynasty.com",
    }),
  );
} else if (process.env.SMTP_HOST) {
  providers.push(
    Email({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: process.env.EMAIL_FROM || "noreply@gulshandynasty.com",
    }),
  );
}

if (process.env.NODE_ENV === "development" || process.env.ALLOW_DEV_LOGIN === "true") {
  providers.push(
    Credentials({
      name: "Dev Login",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        if (!email) return null;
        const { db } = await import("@/lib/db");
        let user = await db.user.findUnique({ where: { email } });
        if (!user) {
          user = await db.user.create({
            data: {
              email,
              name: email.split("@")[0],
              globalRole: "RESIDENT",
              approvalStatus: "PENDING",
              isActive: true,
            },
          });
        }
        return { id: user.id, name: user.name, email: user.email, image: user.avatarUrl };
      },
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // On first sign-in, create or find user in DB
      // This runs server-side (not edge), so Prisma is safe here
      if (account?.provider) {
        try {
          const { db } = await import("@/lib/db");
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create new user with PENDING status
            const newUser = await db.user.create({
              data: {
                email: user.email!,
                name: user.name ?? "User",
                avatarUrl: user.image,
                globalRole: "RESIDENT",
                approvalStatus: "PENDING",
                isActive: true,
              },
            });
            user.id = newUser.id;
          } else {
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error("Sign-in callback error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }

      const shouldRefresh =
        trigger === "update" ||
        !!user ||
        (token.id && (!token.fetchedAt || Date.now() - token.fetchedAt > 5 * 60 * 1000));

      if (shouldRefresh && (token.email || token.id)) {
        try {
          const { db } = await import("@/lib/db");
          const { getLeaderScopes, hasAnyLeaderScope } = await import("@/lib/leader-scopes");
          const dbUser = await db.user.findUnique({
            where: token.email ? { email: token.email } : { id: token.id as string },
            select: {
              id: true,
              globalRole: true,
              approvalStatus: true,
              isActive: true,
              termsAcceptedAt: true,
            },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.globalRole = dbUser.globalRole;
            token.approvalStatus = dbUser.approvalStatus;
            token.isActive = dbUser.isActive;
            token.termsAcceptedAt = dbUser.termsAcceptedAt;
            const scopes = await getLeaderScopes(dbUser.id);
            token.leaderScopes = scopes;
            token.isLeader = hasAnyLeaderScope(scopes);
            token.fetchedAt = Date.now();
          }
        } catch {
          // Silently fail if DB is unavailable
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        Object.assign(session.user, {
          globalRole: token.globalRole,
          approvalStatus: token.approvalStatus,
          isActive: token.isActive,
          termsAcceptedAt: token.termsAcceptedAt,
          isLeader: token.isLeader ?? false,
          leaderScopes: token.leaderScopes ?? null,
        });
      }
      return session;
    },
  },
});
