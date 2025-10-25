import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Crown, Sparkles, Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { subscriptionPlansApi, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/images/hConnect-logo3.png";

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
  features: string[];
  max_members_per_room: number | null;
  is_popular: boolean;
  allows_unlimited_members: boolean;
  annual_savings_percentage?: number;
  annual_savings_amount?: string;
}

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await subscriptionPlansApi.getAll();
      setPlans(response.plans || []);
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

  const handleGetStarted = () => {
    // Redirect to registration page
    navigate("/register");
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
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img src={logo} alt="Hebron Connect" className="h-8 object-contain" />
              <h1 className="text-lg sm:text-xl font-bold">Subscription Plans</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                className="text-white hover:bg-white/20 text-sm sm:text-base"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/register")}
                className="bg-white text-[#1e40af] hover:bg-blue-50 rounded-xl text-sm sm:text-base"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] flex items-center justify-center shadow-lg">
                <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8">
              Empower your community with the right tools. Start free or unlock premium features.
            </p>

            {/* Billing Toggle */}
            {plans.some(p => p.annual_price) && (
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
                      Save {Math.round(plans.find(p => p.annual_savings_percentage)?.annual_savings_percentage || 0)}%
                    </Badge>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {plans.map((plan, index) => {
              const Icon = index === 0 ? Zap : index === 1 ? Crown : Sparkles;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all p-6 sm:p-8 relative overflow-hidden ${
                    plan.is_popular ? "ring-2 ring-[#1e40af] scale-105" : ""
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.is_popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] text-white px-4 py-1 rounded-bl-2xl text-xs sm:text-sm font-semibold">
                      Most Popular
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${getBgColor(index)} flex items-center justify-center mb-6`}>
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
                    onClick={handleGetStarted}
                    className={`w-full h-12 sm:h-14 rounded-xl font-semibold text-base sm:text-lg transition-all ${
                      plan.is_popular
                        ? "bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] hover:shadow-lg text-white"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    Get Started
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Feature Comparison */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
              Why Choose Hebron Connect?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Easy to Use
                </h4>
                <p className="text-gray-600">
                  Simple and intuitive interface designed for communities of all sizes
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Powerful Features
                </h4>
                <p className="text-gray-600">
                  Everything you need to manage events, contributions, and communications
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  24/7 Support
                </h4>
                <p className="text-gray-600">
                  Our team is always ready to help you succeed with your community
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of communities already using Hebron Connect to stay connected and organized.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate("/register")}
                className="bg-white text-[#1e40af] hover:bg-blue-50 rounded-xl h-12 sm:h-14 px-8 text-base sm:text-lg font-semibold shadow-lg w-full sm:w-auto"
              >
                Create Free Account
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/20 rounded-xl h-12 sm:h-14 px-8 text-base sm:text-lg font-semibold w-full sm:w-auto"
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-12 text-center">
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
              All paid plans include a 7-day money-back guarantee
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 px-4 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>© 2025 Hebron Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SubscriptionPlans;

