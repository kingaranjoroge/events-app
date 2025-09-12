import { Calendar, MapPin, Users, Star, CheckCircle } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Calendar,
      title: "Easy Discovery",
      description: "Find events tailored to your interests with our smart recommendation system and advanced filters."
    },
    {
      icon: MapPin,
      title: "Location-Based",
      description: "Discover events happening near you or in your favorite cities with our location-based search."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Connect with like-minded people, share experiences, and build lasting relationships through events."
    },
    {
      icon: Star,
      title: "Quality Events",
      description: "Every event is verified and reviewed by our community to ensure the best experience for attendees."
    },
    {
      icon: CheckCircle,
      title: "Easy Booking",
      description: "Book your spot in just a few clicks with our streamlined booking process and instant confirmations."
    },
    {
      icon: Calendar,
      title: "Event Management",
      description: "Create and manage your own events with our comprehensive event management tools and analytics."
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Why Choose EventHub?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We make event discovery and management simple, secure, and enjoyable for everyone.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="bg-card p-8 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
