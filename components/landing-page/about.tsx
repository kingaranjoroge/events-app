import { Users, Heart } from "lucide-react";

export function About() {
  return (
    <section id="about" className="py-20 bg-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">About EventHub</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            EventHub is a community-first platform that makes discovering, creating, and
            managing events simple and accessible. We believe in bringing people together
            to share experiences and build stronger communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card p-8 rounded-lg border shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Community Focused</h3>
            <p className="text-muted-foreground">
              We prioritize community engagement by supporting local organizers and enabling
              attendees to connect, share feedback, and discover meaningful experiences.
            </p>
          </div>

          <div className="bg-card p-8 rounded-lg border shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Built with Care</h3>
            <p className="text-muted-foreground">
              From intuitive discovery to smooth booking flows, our product is designed to
              make hosting and attending events delightful and reliable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
