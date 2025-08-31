"use client";

import { useRouter, useSearchParams } from "next/navigation";
// Import the signIn function from next-auth
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wasRegistrationSuccessful = searchParams.get("registered") === "true";
  // Check for an error message in the URL, which NextAuth will add on failed login
  const errorParam = searchParams.get("error");

  const [identifier, setIdentifier] = useState(""); // Can be username or email
  const [password, setPassword] = useState("");
  // Use the error from the URL if it exists
  const [error, setError] = useState<string | null>(
    errorParam ? "Invalid username or password" : null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Use the signIn function from NextAuth
    const result = await signIn("credentials", {
      // Pass the credentials to our authorize function
      identifier,
      password,
      // Tell NextAuth to not redirect us automatically, we'll handle it
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      // If there's an error, NextAuth returns it here
      setError("Invalid username or password.");
    } else if (result?.ok) {
      // If sign-in is successful, redirect to the dashboard
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">invitree</h1>
          <p className="mt-2 text-gray-600">Welcome back! Please sign in.</p>
        </div>

        {wasRegistrationSuccessful && !error && (
          <div className="p-3 text-sm text-green-800 bg-green-100 border border-green-200 rounded-md">
            <p>
              <span className="font-semibold">Success!</span> Your account has
              been created. Please log in.
            </p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email or Username
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="email"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-md">
              <p>
                <span className="font-semibold">Error:</span> {error}
              </p>
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </a>
        </p>
      </div>
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
