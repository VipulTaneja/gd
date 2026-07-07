"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { greetings } from "@/lib/microcopy";

const POST_LOGIN_URL = "/";

const DEV_EMAILS = [
  { label: "Vipul (Super Admin)", email: "noemail-919891777078@gulshandynasty.local" },
  { label: "Super Admin (setup)", email: "admin+dev-setup-secret@gulshandynasty.com" },
  { label: "Rajesh (Admin)", email: "rajesh@example.com" },
  { label: "Priya (Resident)", email: "priya@example.com" },
  { label: "Amit (Resident)", email: "amit@example.com" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [showProviders, setShowProviders] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [devError, setDevError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();

  // Strip stale ?error= from URL so it isn't reused as the sign-in callbackUrl
  useEffect(() => {
    if (window.location.search.includes("error=")) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        <div className="text-center">
          <Image
            src="https://www.gulshandynasty.com/images/logo.webp"
            alt="Gulshan Dynasty"
            width={200}
            height={50}
            className="mx-auto h-12 w-auto"
            priority
          />
          <h1 className="mt-6 font-heading text-2xl font-bold tracking-tight">{greetings.loginTitle}</h1>
          <p className="mt-2 text-muted-foreground">
            {greetings.loginSubtitle}
          </p>
        </div>

        <div className="space-y-4">
          {process.env.NEXT_PUBLIC_APP_URL?.includes("localhost") && (
            <div className="rounded-lg border border-dashed border-gold/50 bg-gold/5 p-4 space-y-2">
              <p className="text-xs font-medium text-gold">Dev Mode — Quick Login</p>
              {devError && (
                <p className="text-sm text-red-600">{devError}</p>
              )}
              {DEV_EMAILS.map((dev) => (
                <button
                  key={dev.email}
                  onClick={async () => {
                    setDevError(null);
                    try {
                      const res = await signIn("credentials", {
                        email: dev.email,
                        redirect: false,
                        callbackUrl: POST_LOGIN_URL,
                      });
                      if (!res?.ok) {
                        setDevError(res?.error ?? "Sign-in failed. Try again.");
                        return;
                      }
                      router.push(POST_LOGIN_URL);
                      router.refresh();
                    } catch (err) {
                      console.error("Sign-in failed:", err);
                      setDevError("Sign-in failed. Try again.");
                    }
                  }}
                  className="flex h-11 w-full items-center justify-between rounded-md border bg-background px-3 text-sm hover:bg-muted transition-colors"
                >
                  <span className="font-medium">{dev.label}</span>
                  <span className="text-xs text-muted-foreground truncate ml-2 max-w-[140px] sm:max-w-none">{dev.email}</span>
                </button>
              ))}
            </div>
          )}

          {!showProviders ? (
            <>
              <button
                onClick={() => setShowProviders(true)}
                className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => setShowProviders(true)}
                className="flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Continue with Apple
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email) {
                    startSending(async () => {
                      await signIn("email", { email, callbackUrl: POST_LOGIN_URL });
                      setEmailSent(true);
                    });
                  }
                }}
                className="space-y-3"
              >
                {emailSent ? (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <p className="text-sm font-medium text-green-800">Check your email!</p>
                    <p className="text-xs text-green-700">We sent a login link to {email}</p>
                  </div>
                ) : (
                  <>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex h-11 w-full rounded-lg border border-input bg-transparent px-4 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <button
                      type="submit"
                      disabled={sending}
                      className="flex h-11 w-full items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gold-light disabled:opacity-50"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Send Magic Link"
                      )}
                    </button>
                  </>
                )}
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => signIn("google", { callbackUrl: POST_LOGIN_URL })}
                className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>

              <button
                onClick={() => signIn("apple", { callbackUrl: POST_LOGIN_URL })}
                className="flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Sign in with Apple
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email) {
                    signIn("email", { email, callbackUrl: POST_LOGIN_URL });
                  }
                }}
                className="space-y-3"
              >
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-transparent px-4 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gold-light"
                >
                  Send Magic Link
                </button>
              </form>

              <button
                onClick={() => setShowProviders(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/faq" className="underline hover:text-foreground">
            Help & FAQ
          </Link>
          {" · "}
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
