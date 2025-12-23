"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle } from "lucide-react";

export default function EventBooking({
  eventId,
  remaining,
}: {
  eventId: string;
  remaining: number;
}) {
  const [tickets, setTickets] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      router.push(`/signin?next=/events/${eventId}`);
      return;
    }

    if (tickets < 1 || tickets > remaining) {
      setError("Invalid number of tickets");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ eventId, tickets }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Booking failed. Please try again.");
        return;
      }

      setSuccess(true);
      setTickets(1);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isSoldOut = remaining === 0;

  if (isSoldOut && !success) {
    return (
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">This event is sold out</p>
          <p className="text-sm text-muted-foreground">
            Check back later for availability
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-6 rounded-lg border border-green-500/20 shadow-sm bg-green-500/5">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-lg font-semibold mb-2 text-green-600">
            Booking Confirmed!
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {tickets} {tickets === 1 ? "ticket" : "tickets"} booked successfully
          </p>
          <p className="text-xs text-muted-foreground">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg border shadow-sm">
      <div className="space-y-4">
        {/* Remaining Tickets Info */}
        <div className="p-3 bg-primary/10 rounded-md">
          <p className="text-sm font-semibold text-foreground">
            {remaining} {remaining === 1 ? "seat" : "seats"} available
          </p>
          <div className="mt-2 w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{
                width: remaining === 0 ? "0%" : `${Math.min((remaining / 10) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Tickets Input */}
        <div>
          <label htmlFor="tickets" className="block text-sm font-medium mb-2">
            Number of Tickets
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTickets(Math.max(1, tickets - 1))}
              disabled={loading || tickets <= 1}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-3"
            >
              −
            </button>
            <input
              id="tickets"
              type="number"
              min="1"
              max={remaining}
              value={tickets}
              onChange={(e) => setTickets(Math.min(remaining, Math.max(1, parseInt(e.target.value) || 1)))}
              disabled={loading}
              className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-center font-semibold"
            />
            <button
              type="button"
              onClick={() => setTickets(Math.min(remaining, tickets + 1))}
              disabled={loading || tickets >= remaining}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-3"
            >
              +
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-destructive/10 rounded-md flex gap-2">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Book Button */}
        <Button
          type="submit"
          disabled={loading || !user || tickets < 1 || tickets > remaining}
          className="w-full"
          size="lg"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Booking..." : "Book Now"}
        </Button>

        {/* Sign In Prompt */}
        {!user && (
          <p className="text-xs text-muted-foreground text-center">
            Sign in to book tickets
          </p>
        )}

        {/* Price Info (optional) */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Price will be determined at checkout
          </p>
        </div>
      </div>
    </form>
  );
}
