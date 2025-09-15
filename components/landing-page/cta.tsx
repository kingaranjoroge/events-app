import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-secondary">
            Ready to Start Your Event Journey?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of event enthusiasts and discover your next favorite event today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Browse Events
            </Button>
            <Button size="lg" variant="default" className="text-lg px-8 py-6 border-primary-foreground text-primary-background hover:bg-primary-foreground hover:text-primary">
              Create Account
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
