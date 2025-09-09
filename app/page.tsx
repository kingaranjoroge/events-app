import { Navigation, Hero, Features, CTA, Footer } from "@/components/sections";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navigation />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}
