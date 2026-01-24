import { redirect } from "next/navigation";
import { Calendar, User, Ticket, MapPin } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { BookingsList } from "@/components/dashboard/bookings-list";

export default async function Dashboard() {
  const supabaseClient = await createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  // Get user profile
  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get user's events (as organizer)
  const { data: organizedEvents } = await supabaseClient
    .from("events")
    .select("*")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false });

  // Get user's bookings with event info
  const { data: bookings } = await supabaseClient
    .from("bookings")
    .select(`
      *,
      events (
        id,
        title,
        starts_at,
        location
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const confirmedBookings = bookings?.filter((b) => b.status === "confirmed") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.full_name || user.email}!
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Events Organized</p>
                <p className="text-2xl font-bold">{organizedEvents?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bookings (confirmed)</p>
                <p className="text-2xl font-bold">{confirmedBookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profile Status</p>
                <p className="text-2xl font-bold">{profile ? "Complete" : "Incomplete"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile */}
          <div className="lg:col-span-1 bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <ProfileForm profile={profile} />
          </div>

          {/* Bookings */}
          <div className="lg:col-span-2 bg-card p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">My Bookings</h2>
              <p className="text-xs text-muted-foreground">Cancel confirmed bookings directly</p>
            </div>
            <BookingsList bookings={bookings || []} />
          </div>
        </div>

        {/* Organized Events */}
        <div className="mt-10 bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">My Events</h2>
          {organizedEvents && organizedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {organizedEvents.slice(0, 6).map((event) => (
                <div key={event.id} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">{event.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.starts_at).toLocaleDateString()}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No events created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
