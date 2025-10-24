import { Shield, Lock, CreditCard, Award } from "lucide-react";

const TrustBadges = () => {
  const badges = [
    { icon: Shield, text: "30-Day Money Back" },
    { icon: Lock, text: "Secure Payment" },
    { icon: CreditCard, text: "All Cards Accepted" },
    { icon: Award, text: "Trusted by 10,000+" }
  ];

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {badges.map((badge, index) => (
          <div 
            key={index}
            className="flex flex-col items-center gap-3 p-4 rounded-lg backdrop-blur-sm bg-card/20 border border-border/30 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <badge.icon className="w-8 h-8 text-primary" />
            <span className="text-sm text-center text-foreground/80 font-medium">
              {badge.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustBadges;
