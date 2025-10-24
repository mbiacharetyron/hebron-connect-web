import { useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import PricingToggle from "@/components/PricingToggle";
import PricingCard from "@/components/PricingCard";
import TrustBadges from "@/components/TrustBadges";
import FAQSection from "@/components/FAQSection";

const Index = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Basic",
      price: 19,
      yearlyPrice: 182,
      features: [
        "Up to 5 projects",
        "Basic analytics",
        "24/7 customer support",
        "1GB storage",
        "Email notifications",
        "Mobile app access",
      ],
      accentColor: "primary" as const,
    },
    {
      name: "Pro",
      price: 49,
      yearlyPrice: 470,
      features: [
        "Unlimited projects",
        "Advanced analytics",
        "Priority support",
        "50GB storage",
        "Custom integrations",
        "Team collaboration",
        "API access",
        "Advanced reporting",
      ],
      accentColor: "secondary" as const,
      isPopular: true,
    },
    {
      name: "Enterprise",
      price: 99,
      yearlyPrice: 950,
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom SLA",
        "Unlimited storage",
        "White-label solution",
        "Advanced security",
        "Custom development",
        "On-premise deployment",
      ],
      accentColor: "accent" as const,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-12 px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 animate-slide-up bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
            Choose Your Plan
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Unlock premium features and take your experience to the next level
          </p>

          <PricingToggle isYearly={isYearly} onToggle={setIsYearly} />
        </section>

        {/* Pricing Cards */}
        <section className="px-4 pb-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
            {plans.map((plan, index) => (
              <PricingCard
                key={plan.name}
                {...plan}
                isYearly={isYearly}
                delay={index * 150}
              />
            ))}
          </div>
        </section>

        {/* Trust Badges */}
        <TrustBadges />

        {/* FAQ Section */}
        <FAQSection />

        {/* Footer */}
        <footer className="py-8 px-4 text-center border-t border-border/30">
          <p className="text-muted-foreground">
            Questions? Contact us at{" "}
            <a href="mailto:support@example.com" className="text-primary hover:underline">
              support@example.com
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
