import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="font-heading text-6xl font-bold text-gold">404</div>
        <h1 className="font-heading text-2xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black hover:bg-gold-light"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
