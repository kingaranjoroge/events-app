"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket, XCircle, Loader2, CheckCircle2 } from "lucide-react";

interface BookingEvent {
  id: string;
  title: string | null;
  starts_at: string | null;
  location: string | null;
}

interface Booking {
  id: string;
  num_tickets: number;
  status: string;
  created_at: string;
  events: BookingEvent | null;
}

interface BookingsListProps {
  bookings: Booking[];
}

export function BookingsList({ bookings: initialBookings }: BookingsListProps) {
  const [bookings, setBookings] = useState(initialBookings || []);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    setLoadingId(id);
    setSuccessId(null);

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to cancel booking");
      }
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
      setSuccessId(id);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Unable to cancel booking");
    } finally {
      setLoadingId(null);
    }
  };

  if (!bookings || bookings.length === 0) {
    return <p className="text-muted-foreground">No bookings yet.</p>;
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const startsAt = booking.events?.starts_at
          ? new Date(booking.events.starts_at)
          : null;

        const statusStyles =
          booking.status === "confirmed"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : booking.status === "cancelled"
            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";

        return (
          <div key={booking.id} className="border rounded-lg p-4 bg-card shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{booking.events?.title || "Untitled Event"}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {startsAt && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {startsAt.toLocaleDateString()} {" "}
                      {startsAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  )}
                  {booking.events?.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {booking.events.location}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Ticket className="h-4 w-4" />
                    {booking.num_tickets} {booking.num_tickets === 1 ? "ticket" : "tickets"}
                  </span>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusStyles}`}>
                    {booking.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {successId === booking.id && (
                  <div className="inline-flex items-center gap-1 text-emerald-600 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Cancelled
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={booking.status !== "confirmed" || loadingId === booking.id}
                  onClick={() => handleCancel(booking.id)}
                  className="flex items-center gap-2"
                >
                  {loadingId === booking.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
