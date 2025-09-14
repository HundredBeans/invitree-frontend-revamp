import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Invitation Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The invitation you're looking for doesn't exist or may have been removed.
          Please check the URL or contact the person who shared this invitation with you.
        </p>
        <div className="space-y-3">
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Homepage
          </Link>
          <p className="text-sm text-muted-foreground">
            Need help? Contact support for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
