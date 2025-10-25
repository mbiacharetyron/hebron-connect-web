import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { subscriptionPlansApi, connectRoomsApi, subscriptionApi, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OriginalPrices {
  monthly_price: string;
  annual_price?: string;
  formatted_monthly_price: string;
  formatted_annual_price?: string;
  currency: string;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  monthly_price: string;
  annual_price?: string;
  formatted_monthly_price: string;
  formatted_annual_price?: string;
  currency: string;
  was_converted?: boolean;
  original_prices?: OriginalPrices;
  features: string[];
  max_members_per_room: number | null;
  is_popular: boolean;
  allows_unlimited_members: boolean;
  annual_savings_percentage?: number;
  annual_savings_amount?: string;
}

interface Room {
  id: number;
  name: string;
  subscription_plan?: {
    id: number;
    name: string;
    status: string;
    expires_at?: string;
  };
}

const RoomSubscriptionPlans = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);
  const [convertedCurrency, setConvertedCurrency] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlansAndRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const fetchPlansAndRoom = async () => {
    try {
      // Fetch current room details first
      if (roomId) {
        const roomsResponse = await connectRoomsApi.getMyRooms({ per_page: 50 });
        const currentRoom = roomsResponse.rooms?.find((r) => r.id === Number(roomId));
        if (currentRoom) {
          setRoom(currentRoom as Room);
        }
      }

      // Fetch subscription plans with room_id for currency conversion
      const plansResponse = await subscriptionPlansApi.getAll(roomId ? Number(roomId) : undefined);
      setPlans(plansResponse.plans || []);
      setConvertedCurrency(plansResponse.converted_currency || null);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load subscription plans. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsCheckoutDialogOpen(true);
  };

  const handleConfirmCheckout = async () => {
    if (!selectedPlan || !roomId) return;

    setIsProcessing(true);
    try {
      const currentUrl = window.location.origin;
      const billingCycle = isYearly ? 'annual' : 'monthly';
      
      const checkoutSession = await subscriptionApi.createCheckout(Number(roomId), {
        plan_id: selectedPlan.id,
        billing_cycle: billingCycle,
        success_url: `${currentUrl}/room/${roomId}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${currentUrl}/room/${roomId}/subscription-plans`,
      });

      // Redirect to Stripe checkout
      if (checkoutSession.session_url) {
        window.location.href = checkoutSession.session_url;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create checkout session. Please try again.",
        });
      }
    } finally {
      setIsProcessing(false);
      setIsCheckoutDialogOpen(false);
    }
  };

  const getCurrentPlanPrice = () => {
    if (!room?.subscription_plan?.id) return 0;
    const currentPlan = plans.find(p => p.id === room.subscription_plan?.id);
    return currentPlan ? parseFloat(currentPlan.monthly_price) : 0;
  };

  const getPlanComparison = (plan: SubscriptionPlan) => {
    const currentPlanId = room?.subscription_plan?.id;
    if (!currentPlanId) return "upgrade";
    if (plan.id === currentPlanId) return "current";
    
    const currentPrice = getCurrentPlanPrice();
    const planPrice = parseFloat(plan.monthly_price);
    
    return planPrice > currentPrice ? "upgrade" : "downgrade";
  };

  const getAccentColor = (index: number) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-orange-500 to-orange-600",
    ];
    return colors[index % colors.length];
  };

  const getIconColor = (index: number) => {
    const colors = ["text-blue-600", "text-purple-600", "text-orange-600"];
    return colors[index % colors.length];
  };

  const getBgColor = (index: number) => {
    const colors = ["bg-blue-50", "bg-purple-50", "bg-orange-50"];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e40af]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 mr-3"
              onClick={() => navigate(`/room/${roomId}/settings`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Subscription Plans</h1>
              {room && (
                <p className="text-xs sm:text-sm text-blue-100">{room.name}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Currency Conversion Notice */}
          {convertedCurrency && plans.some(p => p.was_converted) && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                    Prices Converted to {convertedCurrency}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    All prices are shown in {convertedCurrency} (your room's currency). Original prices are displayed below each plan for reference.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] flex items-center justify-center">
                <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Choose Your Plan
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8">
              Unlock premium features and take your connect room to the next level
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 sm:gap-4 bg-white rounded-2xl p-1.5 sm:p-2 shadow-sm border border-gray-200">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all ${
                  !isYearly
                    ? "bg-[#1e40af] text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all flex items-center gap-2 ${
                  isYearly
                    ? "bg-[#1e40af] text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Yearly
                {plans.some(p => p.annual_savings_percentage) && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                    Save {Math.round(plans[0]?.annual_savings_percentage || 0)}%
                  </Badge>
                )}
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
            {plans.map((plan, index) => {
              const comparison = getPlanComparison(plan);
              const isCurrentPlan = comparison === "current";
              const Icon = index === 0 ? Zap : index === 1 ? Crown : Sparkles;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all p-6 sm:p-8 relative overflow-hidden ${
                    plan.is_popular && !isCurrentPlan ? "ring-2 ring-[#1e40af] scale-105" : ""
                  } ${isCurrentPlan ? "ring-2 ring-green-500 scale-105" : ""}`}
                >
                  {/* Popular Badge */}
                  {plan.is_popular && !isCurrentPlan && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] text-white px-4 py-1 rounded-bl-2xl text-xs sm:text-sm font-semibold">
                      Most Popular
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1.5 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" />
                      YOUR CURRENT PLAN
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${getBgColor(index)} flex items-center justify-center mb-6 mt-${isCurrentPlan ? '6' : '0'}`}>
                    <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${getIconColor(index)}`} />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-600 mb-6">
                    {plan.description}
                  </p>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                        {isYearly && plan.annual_price
                          ? plan.formatted_annual_price?.split(' ')[0]
                          : plan.formatted_monthly_price?.split(' ')[0]}
                      </span>
                      <span className="text-gray-600 font-medium">
                        {plan.currency}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      per {isYearly ? 'year' : 'month'}
                    </p>
                    
                    {/* Show original price if currency was converted */}
                    {plan.was_converted && plan.original_prices && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Original price:</p>
                        <p className="text-sm font-medium text-gray-700">
                          {isYearly && plan.original_prices.annual_price
                            ? plan.original_prices.formatted_annual_price
                            : plan.original_prices.formatted_monthly_price}
                        </p>
                      </div>
                    )}
                    
                    {isYearly && plan.annual_savings_amount && (
                      <p className="text-sm text-green-600 font-medium mt-2">
                        Save {plan.annual_savings_amount} {plan.currency} annually
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 sm:space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${getAccentColor(index)} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.allows_unlimited_members && (
                      <li className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${getAccentColor(index)} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm sm:text-base text-gray-700">
                          Unlimited members
                        </span>
                      </li>
                    )}
                    {!plan.allows_unlimited_members && plan.max_members_per_room && (
                      <li className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${getAccentColor(index)} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm sm:text-base text-gray-700">
                          Up to {plan.max_members_per_room} members
                        </span>
                      </li>
                    )}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isCurrentPlan}
                    className={`w-full h-12 sm:h-14 rounded-xl font-semibold text-base sm:text-lg transition-all ${
                      isCurrentPlan
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : comparison === "upgrade"
                        ? "bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] hover:shadow-lg text-white"
                        : "bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg text-white"
                    }`}
                  >
                    {isCurrentPlan 
                      ? "Current Plan" 
                      : comparison === "upgrade" 
                      ? "Upgrade" 
                      : "Downgrade"}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Current Subscription Info */}
          {room?.subscription_plan ? (
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 sm:p-8 border-2 border-green-300 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Your Current Subscription
                  </h3>
                  <p className="text-base sm:text-lg text-gray-800 mb-2">
                    You are currently subscribed to the{" "}
                    <span className="font-bold text-green-700">{room.subscription_plan.name}</span>
                  </p>
                  {room.subscription_plan.expires_at && (
                    <p className="text-sm sm:text-base text-gray-700">
                      Valid until{" "}
                      <span className="font-semibold">
                        {new Date(room.subscription_plan.expires_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                  )}
                  {room.subscription_plan.status !== "active" && (
                    <Badge variant="destructive" className="mt-2">
                      {room.subscription_plan.status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 sm:p-8 border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    No Active Subscription
                  </h3>
                  <p className="text-base sm:text-lg text-gray-700">
                    Choose a plan above to unlock premium features for your connect room
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FAQ or Additional Info */}
          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Questions about our plans?{" "}
              <button
                onClick={() =>
                  toast({
                    title: "Contact Support",
                    description: "Support contact feature is under development",
                  })
                }
                className="text-[#1e40af] hover:underline font-medium"
              >
                Contact our team
              </button>
            </p>
            <p className="text-sm text-gray-500">
              All plans include a 7-day money-back guarantee
            </p>
          </div>
        </div>
      </main>

      {/* Checkout Confirmation Dialog */}
      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Confirm Subscription</DialogTitle>
            <DialogDescription>
              You're about to subscribe to the {selectedPlan?.name} plan
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Plan:</span>
                  <span className="font-semibold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Billing:</span>
                  <span className="font-semibold">{isYearly ? 'Annual' : 'Monthly'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="font-bold text-lg text-[#1e40af]">
                    {isYearly && selectedPlan.annual_price
                      ? selectedPlan.formatted_annual_price
                      : selectedPlan.formatted_monthly_price}
                  </span>
                </div>
                {selectedPlan.was_converted && selectedPlan.original_prices && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Original price:</span>
                      <span className="text-xs text-gray-600">
                        {isYearly && selectedPlan.original_prices.annual_price
                          ? selectedPlan.original_prices.formatted_annual_price
                          : selectedPlan.original_prices.formatted_monthly_price}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  • You'll be redirected to Stripe to complete payment
                </p>
                <p className="text-sm text-gray-600">
                  • Your subscription activates immediately after payment
                </p>
                <p className="text-sm text-gray-600">
                  • You can cancel anytime from subscription settings
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCheckoutDialogOpen(false)}
              disabled={isProcessing}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCheckout}
              disabled={isProcessing}
              className="bg-[#1e40af] hover:bg-[#1e3a8a] rounded-xl"
            >
              {isProcessing ? "Processing..." : "Proceed to Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomSubscriptionPlans;

