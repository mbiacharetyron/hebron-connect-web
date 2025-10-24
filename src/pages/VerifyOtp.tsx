import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { authApi, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { identifier, type, context } = location.state || {};

  useEffect(() => {
    if (!identifier || !type) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing verification information",
      });
      navigate("/register");
    }
  }, [identifier, type, navigate, toast]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter a 6-digit code",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authApi.verifyOtp({
        otp,
        identifier,
        type,
      });

      toast({
        title: "Success",
        description: "Verification successful",
        className: "bg-green-500 text-white",
      });

      // Navigate based on context
      if (context === "register") {
        // Store verification token and navigate to complete registration
        navigate("/complete-registration", {
          state: {
            verification_token: response.verification_token,
            identifier,
            type,
          },
        });
      } else if (context === "forgot-password") {
        // Navigate to reset password page
        navigate("/reset-password", {
          state: {
            otp,
            identifier,
          },
        });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred",
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authApi.sendOtp({
        identifier,
        type,
      });

      toast({
        title: "Success",
        description: "Verification code has been sent to your " + type,
        className: "bg-green-500 text-white",
      });
      
      setCountdown(60); // 60 seconds cooldown
      setOtp(""); // Clear OTP input
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Failed to Resend",
          description: error.message,
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link
          to="/register"
          className="inline-flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="h-1 w-20 bg-[#1e40af] rounded-full"></div>
          <div className="h-1 w-20 bg-[#1e40af] rounded-full"></div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Enter authentication code
            </h2>
            <p className="text-gray-600">
              We've sent a verification code to your {type === "email" ? "email" : "phone"}
            </p>
          </div>

          {/* OTP Input */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 block">Code</label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  onComplete={handleVerify}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-lg border-gray-300 rounded-xl" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-lg border-gray-300 rounded-xl" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-lg border-gray-300 rounded-xl" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-lg border-gray-300 rounded-xl" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-lg border-gray-300 rounded-xl" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-lg border-gray-300 rounded-xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleVerify}
              disabled={isVerifying || otp.length !== 6}
              className="w-full h-14 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-full text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isVerifying ? "Verifying..." : "Submit"}
            </Button>

            {/* Resend Button */}
            <Button
              onClick={handleResend}
              disabled={isResending || countdown > 0}
              variant="ghost"
              className="w-full h-14 text-gray-700 hover:text-gray-900 rounded-full text-base font-medium hover:bg-gray-100 transition-all duration-200"
            >
              {countdown > 0
                ? `Resend Code (${countdown}s)`
                : isResending
                ? "Sending..."
                : "Resend Code"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;

