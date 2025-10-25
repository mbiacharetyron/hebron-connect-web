import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const SubscriptionSuccess = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (!sessionId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid payment session",
      });
      navigate(`/room/${roomId}/subscription-plans`);
      return;
    }

    // Simulate verification (in a real app, you'd verify with your backend)
    setTimeout(() => {
      setIsVerifying(false);
    }, 2000);
  }, [searchParams, roomId, navigate, toast]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#1e40af] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying your payment...
          </h2>
          <p className="text-gray-600">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Subscription Activated!
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            Your payment was successful. Your room now has access to premium features.
          </p>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">What's next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>All premium features are now unlocked</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>You'll receive a confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Manage your subscription anytime from settings</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate(`/room/${roomId}`)}
              className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] rounded-xl h-12 text-base font-semibold"
            >
              Go to Room Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/room/${roomId}/subscription-manage`)}
              className="w-full rounded-xl h-12 text-base"
            >
              Manage Subscription
            </Button>
          </div>
        </div>

        {/* Support Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Need help?{" "}
          <button
            onClick={() =>
              toast({
                title: "Contact Support",
                description: "Support feature is under development",
              })
            }
            className="text-[#1e40af] hover:underline font-medium"
          >
            Contact support
          </button>
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;

