import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface PricingToggleProps {
  isYearly: boolean;
  onToggle: (checked: boolean) => void;
}

const PricingToggle = ({ isYearly, onToggle }: PricingToggleProps) => {
  return (
    <div className="flex items-center justify-center gap-4 mb-12 animate-slide-up">
      <span className={`text-lg font-medium transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
        Monthly
      </span>
      <Switch
        checked={isYearly}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
      <span className={`text-lg font-medium transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
        Yearly
      </span>
      {isYearly && (
        <Badge className="bg-accent text-accent-foreground animate-scale-in">
          Save 20%
        </Badge>
      )}
    </div>
  );
};

export default PricingToggle;
