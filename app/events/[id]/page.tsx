import { createClient } from "@/utils/supabase/server";
import { Calendar, MapPin, Users } from "lucide-react";
import EventBooking from "@/components/events/event-booking";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props) {
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("title, description")
    .eq("id", params.id)
    .eq("is_published", true)
    .single();

  return {
    title: event?.title || "Event - EventHub",
    description: event?.description || "Discover amazing events near you",
  };
}

export default async function EventPage({ params }: Props) {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select(
      `
      *,
      profiles!events_organizer_id_fkey (
        id,
        full_name,
        avatar_url
      ),
      event_categories (
        categories (
          id,
          name,
          slug
        )
      )
    `
    )
    .eq("id", params.id)
    .eq("is_published", true)
    .single();

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-card p-8 rounded-lg border shadow-sm text-center">
            <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">
              Sorry, we couldn't find the event you're looking for.
            </p>
            <a
              href="/events"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2"
            >
              Back to Events
            </a>
          </div>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;
  const categories = event.event_categories
    .map((ec: any) => ec.categories?.name)
    .filter(Boolean);
  const remaining = Math.max(0, (event.capacity || 0) - (event.tickets_sold || 0));
  const isSoldOut = remaining === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <a
          href="/events"
          className="text-primary hover:underline text-sm font-medium mb-8 inline-block"
        >
          ← Back to Events
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header Section */}
            <div className="bg-card p-8 rounded-lg border shadow-sm mb-8">
              <div className="mb-6">
                {/* Categories */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map((category: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title and Status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                    {event.profiles && (
                      <p className="text-muted-foreground">
                        Organized by{" "}
                        <span className="font-semibold">
                          {event.profiles.full_name || "Unknown"}
                        </span>
                      </p>
                    )}
                  </div>
                  {isSoldOut && (
                    <div className="px-4 py-2 rounded-md bg-destructive/10 text-destructive font-medium text-sm whitespace-nowrap">
                      Sold Out
                    </div>
                  )}
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-foreground">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">
                      {startDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {startDate.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                      {endDate && (
                        <>
                          {" "}
                          -{" "}
                          {endDate.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-center gap-3 text-foreground">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                )}

                {event.capacity && (
                  <div className="flex items-center gap-3 text-foreground">
                    <Users className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">
                        {remaining} of {event.capacity} tickets available
                      </p>
                      <div className="mt-2 w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${((event.capacity - remaining) / event.capacity) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description Section */}
            {event.description && (
              <div className="bg-card p-8 rounded-lg border shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">About this event</h2>
                <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <EventBooking eventId={event.id} remaining={remaining} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
