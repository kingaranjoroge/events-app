"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Calendar, ArrowLeft } from "lucide-react";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for expired link error
    const expiredError = searchParams.get('error');
    if (expiredError === 'expired') {
      setError("The reset link has expired. Please request a new one.");
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card p-8 rounded-lg border shadow-sm text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">EventHub</span>
            </div>
            <h1 className="text-2xl font-bold mb-4">Check your email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent you a password reset link at <strong>{email}</strong>
            </p>
            <div className="space-y-4">
              <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
                Send another email
              </Button>
              <Button onClick={() => window.location.href = "/signin"} className="w-full">
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">EventHub</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Forgot your password?</h1>
          <p className="text-muted-foreground">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {/* Form */}
        <div className="bg-card p-8 rounded-lg border shadow-sm">
          <form onSubmit={handleResetPassword} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending reset link..." : "Send reset link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/signin" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card p-8 rounded-lg border shadow-sm text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">EventHub</span>
            </div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
