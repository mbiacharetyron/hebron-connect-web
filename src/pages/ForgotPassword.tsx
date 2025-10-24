import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/images/hConnect-logo3.png";
import { authApi, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contact.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email or phone number",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.forgotPassword({ contact });

      toast({
        title: "Success",
        description: `Verification code has been sent to your ${response.type}`,
        className: "bg-green-500 text-white",
      });

      // Navigate to OTP verification
      navigate("/verify-otp", {
        state: {
          identifier: contact,
          type: response.type,
          context: "forgot-password",
        },
      });
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
          description: "An unexpected error occurred",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Login</span>
        </Link>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <img src={logo} alt="Hebron Connect" className="w-12 h-12 object-contain" />
            <h1 className="text-2xl font-semibold text-[#1e40af]">Hebron Connect</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-600">
              Enter your email or phone number and we'll send you a verification code to reset your password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-sm font-medium text-gray-700">
                Email or Phone Number
              </Label>
              <Input
                id="contact"
                type="text"
                placeholder="Enter your email or phone number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="h-12 px-4 rounded-xl border-gray-200 focus:border-[#1e40af] focus:ring-[#1e40af] text-base"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-full text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? "Sending..." : "Send Verification Code"}
            </Button>

            <p className="text-center text-sm text-gray-600 mt-6">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-[#1e40af] hover:text-[#1e3a8a] font-medium transition-colors"
              >
                Login Here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

