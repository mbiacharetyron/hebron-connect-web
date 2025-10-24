import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PricingCardProps {
  name: string;
  price: number;
  yearlyPrice: number;
  isYearly: boolean;
  features: string[];
  isPopular?: boolean;
  accentColor: "primary" | "secondary" | "accent";
  delay?: number;
}

const PricingCard = ({ 
  name, 
  price, 
  yearlyPrice,
  isYearly, 
  features, 
  isPopular, 
  accentColor,
  delay = 0
}: PricingCardProps) => {
  const displayPrice = isYearly ? yearlyPrice : price;
  const colorClasses = {
    primary: "border-primary/50 hover:border-primary hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)]",
    secondary: "border-secondary/50 hover:border-secondary hover:shadow-[0_0_30px_-5px_hsl(var(--secondary)/0.5)]",
    accent: "border-accent/50 hover:border-accent hover:shadow-[0_0_30px_-5px_hsl(var(--accent)/0.5)]",
  };

  const buttonClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.7)]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[0_0_20px_-5px_hsl(var(--secondary)/0.5)] hover:shadow-[0_0_30px_-5px_hsl(var(--secondary)/0.7)]",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_20px_-5px_hsl(var(--accent)/0.5)] hover:shadow-[0_0_30px_-5px_hsl(var(--accent)/0.7)]",
  };

  return (
    <div 
      className={`relative p-8 rounded-2xl border-2 backdrop-blur-xl bg-card/30 transition-all duration-300 hover:scale-105 animate-slide-up ${colorClasses[accentColor]} ${isPopular ? 'scale-105 lg:scale-110' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground animate-glow-pulse">
          Most Popular
        </Badge>
      )}
      
      <div className="text-center mb-8">
        <h3 className="text-2xl font-display font-bold mb-4">{name}</h3>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-5xl font-display font-bold">${displayPrice}</span>
          <span className="text-muted-foreground">/{isYearly ? 'year' : 'month'}</span>
        </div>
        {isYearly && (
          <p className="text-sm text-muted-foreground mt-2">
            Billed annually (${yearlyPrice})
          </p>
        )}
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 group">
            <div className={`rounded-full p-1 mt-0.5 transition-transform group-hover:scale-110 ${
              accentColor === 'primary' ? 'bg-primary/20' : 
              accentColor === 'secondary' ? 'bg-secondary/20' : 
              'bg-accent/20'
            }`}>
              <Check className={`w-4 h-4 ${
                accentColor === 'primary' ? 'text-primary' : 
                accentColor === 'secondary' ? 'text-secondary' : 
                'text-accent'
              }`} />
            </div>
            <span className="text-foreground/90">{feature}</span>
          </li>
        ))}
      </ul>

      <Button 
        className={`w-full text-lg py-6 font-semibold transition-all duration-300 ${buttonClasses[accentColor]}`}
      >
        Get Started
      </Button>
    </div>
  );
};

export default PricingCard;
