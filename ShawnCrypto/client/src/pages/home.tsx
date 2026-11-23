import Navigation from "@/components/navigation";
import Hero from "@/components/hero";
import Dashboard from "@/components/dashboard";
import Features from "@/components/features";
import Tokenomics from "@/components/tokenomics";
import Contact from "@/components/contact";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-crypto-darker text-white">
      <Navigation />
      <Hero />
      <Dashboard />
      <Features />
      <Tokenomics />
      <Contact />
      <Footer />
    </div>
  );
}
