import { EventCard } from "./event-card";

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

interface EventsListProps {
  events: Event[];
}

export function EventsList({ events }: EventsListProps) {
  if (events.length === 0) {
    return (
      <div className="bg-card p-12 rounded-lg border shadow-sm text-center">
        <h2 className="text-2xl font-semibold mb-4">No events found</h2>
        <p className="text-muted-foreground">
          Try adjusting your search or filters to find more events.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
