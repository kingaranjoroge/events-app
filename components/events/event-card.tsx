import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  profiles: {
    full_name: string | null;
  } | null;
  event_categories: Array<{
    categories: {
      name: string;
      slug: string;
    } | null;
  }>;
}

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;
  const categories = event.event_categories
    .map((ec) => ec.categories?.name)
    .filter(Boolean);

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-all hover:border-primary/50 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            {event.profiles && (
              <p className="text-sm text-muted-foreground">
                by {event.profiles.full_name || "Unknown"}
              </p>
            )}
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 2).map((category, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {startDate.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}{" "}
              at {startDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            {endDate && (
              <span className="ml-2">
                - {endDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          {event.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event.location}</span>
            </div>
          )}

          {event.capacity && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>Capacity: {event.capacity}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
