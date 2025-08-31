"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { Button, Card, CardContent, FormInput } from "@/components/ui";
import { useErrorHandler } from "@/hooks/use-error-handler";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const wasRegistrationSuccessful = searchParams.get("registered") === "true";
  const errorParam = searchParams.get("error");

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { handleError, clearError, showSuccess } = useErrorHandler();

  // Handle URL error parameter
  useEffect(() => {
    if (errorParam) {
      handleError("Invalid username or password");
    }
  }, [errorParam, handleError]);

  // Show loading while checking authentication status
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <div>Loading...</div>
      </div>
    );
  }

  // Don't render login form if user is authenticated
  if (status === "authenticated") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);

    try {
      // Use the signIn function from NextAuth
      const result = await signIn("credentials", {
        // Pass the credentials to our authorize function
        identifier,
        password,
        // Tell NextAuth to not redirect us automatically, we'll handle it
        redirect: false,
      });

      if (result?.error) {
        // If there's an error, NextAuth returns it here
        handleError("Invalid username or password.");
      } else if (result?.ok) {
        // If sign-in is successful, show success message and redirect
        showSuccess("Successfully signed in!");
        router.push("/dashboard");
      }
    } catch (error) {
      handleError(error, "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 font-sans">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">invitree</h1>
            <p className="mt-2 text-gray-600">Welcome back! Please sign in.</p>
          </div>

          {wasRegistrationSuccessful && (
            <div className="p-3 text-sm text-green-800 bg-green-100 border border-green-200 rounded-md">
              <p>
                <span className="font-semibold">Success!</span> Your account has
                been created. Please log in.
              </p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormInput
              id="identifier"
              name="identifier"
              type="text"
              label="Email or Username"
              autoComplete="email"
              required
              value={identifier}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setIdentifier(e.target.value)
              }
            />
            <FormInput
              id="password"
              name="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-medium text-primary hover:text-primary/80"
            >
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// We wrap the component in a Suspense boundary because useSearchParams
// requires it in the Next.js App Router.
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
