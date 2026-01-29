"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Eye, EyeOff, Edit, Trash2, Loader2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  location: string | null;
  starts_at: string;
  capacity: number | null;
  is_published: boolean;
  tickets_sold: number;
  profiles: {
    full_name: string | null;
  } | null;
}

export function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      if (res.ok) {
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ is_published: !currentStatus }),
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, is_published: !currentStatus } : e))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">All Events</h2>
        <p className="text-sm text-muted-foreground">Total: {events.length}</p>
      </div>

      {events.length === 0 ? (
        <p className="text-muted-foreground">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((event) => (
            <div key={event.id} className="bg-card p-4 rounded-lg border shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold break-words">{event.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                        event.is_published
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {event.is_published ? "Published" : "Draft"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      {new Date(event.starts_at).toLocaleDateString()}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </span>
                    )}
                    {event.capacity && (
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        {event.tickets_sold}/{event.capacity} booked
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground truncate">
                    Organizer: {event.profiles?.full_name || "Unknown"}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center flex-wrap justify-start sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublish(event.id, event.is_published)}
                    disabled={actionLoading === event.id}
                  >
                    {actionLoading === event.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : event.is_published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>

                  {/* implement event edit functionality here */}
                  {/* <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button> */}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteEvent(event.id)}
                    disabled={actionLoading === event.id}
                  >
                    {actionLoading === event.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
