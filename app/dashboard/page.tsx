import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, User, Ticket, MapPin } from "lucide-react";

export default async function Dashboard() {
  const supabaseClient = await createClient();
  const { data: { user } } = await supabaseClient.auth.getUser();

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

  // Get user's bookings
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || user.email}!
          </p>
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
                <p className="text-sm text-muted-foreground">Events Attending</p>
                <p className="text-2xl font-bold">{bookings?.length || 0}</p>
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

        {/* Recent Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Events */}
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">My Events</h2>
            {organizedEvents && organizedEvents.length > 0 ? (
              <div className="space-y-4">
                {organizedEvents.slice(0, 3).map((event) => (
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

          {/* My Bookings */}
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
            {bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{booking.events?.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(booking.events?.starts_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Ticket className="h-4 w-4" />
                        <span>{booking.num_tickets} ticket(s)</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No bookings yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
