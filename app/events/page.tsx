import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { EventsList } from "@/components/events/events-list";
import { EventsFilters } from "@/components/events/events-filters";

export const metadata = {
  title: "Events - EventHub",
  description: "Discover amazing events near you",
};

async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  return data || [];
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const categories = await getCategories();

  // Extract search params
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const category = typeof params.category === "string" ? params.category : "";
  const location = typeof params.location === "string" ? params.location : "";
  const date = typeof params.date === "string" ? params.date : "";

  // Build query
  let query = supabase
    .from("events")
    .select(`
      *,
      profiles!events_organizer_id_fkey (
        id,
        full_name
      ),
      event_categories (
        categories (
          id,
          name,
          slug
        )
      )
    `)
    .eq("is_published", true)
    .order("starts_at", { ascending: true });

  // Apply filters
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (location) {
    query = query.ilike("location", `%${location}%`);
  }

  if (date) {
    const dateFilter = new Date(date);
    const nextDay = new Date(dateFilter);
    nextDay.setDate(nextDay.getDate() + 1);
    query = query.gte("starts_at", dateFilter.toISOString()).lt("starts_at", nextDay.toISOString());
  }

  const { data: events, error } = await query;

  if (error) {
    console.error("Error fetching events:", error);
  }

  // Filter by category if specified (client-side filter after fetching)
  let filteredEvents = events || [];
  if (category) {
    filteredEvents = filteredEvents.filter((event) =>
      event.event_categories.some(
        (ec: { categories: { slug: string } | null }) => ec.categories?.slug === category
      )
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Events</h1>
          <p className="text-muted-foreground">
            Find amazing events happening near you
          </p>
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="mb-8">Loading filters...</div>}>
          <EventsFilters categories={categories} searchParams={params} />
        </Suspense>

        {/* Events List */}
        <Suspense fallback={<div>Loading events...</div>}>
          <EventsList events={filteredEvents} />
        </Suspense>
      </div>
    </div>
  );
}
