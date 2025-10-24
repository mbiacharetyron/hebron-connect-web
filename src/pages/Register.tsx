import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import logo from "@/assets/images/hConnect-logo3.png";
import { authApi, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match",
      });
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 8 characters long",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check availability
      await authApi.checkAvailability({
        phone: formData.phoneNumber,
        email: formData.email,
      });
      
      // Show verification method modal
      setShowVerificationModal(true);
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMessage = error.errors
          ? Object.values(error.errors).flat().join(", ")
          : error.message;
        toast({
          variant: "destructive",
          title: "Registration Error",
          description: errorMessage,
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

  const handleVerificationMethod = async (type: "phone" | "email") => {
    const identifier = type === "phone" ? formData.phoneNumber : formData.email;
    
    try {
      await authApi.sendOtp({ identifier, type });
      
      toast({
        title: "Success",
        description: `Verification code has been sent to your ${type}`,
        className: "bg-green-500 text-white",
      });

      // Store registration data in sessionStorage
      sessionStorage.setItem("registration_data", JSON.stringify(formData));
      
      // Navigate to OTP verification
      navigate("/verify-otp", {
        state: {
          identifier,
          type,
          context: "register",
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Failed to Send OTP",
          description: error.message,
        });
      }
    } finally {
      setShowVerificationModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Close button */}
        <Link to="/" className="inline-flex mb-8 text-gray-600 hover:text-gray-900 transition-colors">
          <X className="w-6 h-6" />
        </Link>

        {/* Logo and Title Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <img src={logo} alt="Hebron Connect" className="w-12 h-12 object-contain" />
            <h1 className="text-2xl font-semibold text-[#1e40af]">Hebron Connect</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">Join Hebron Connect today</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="h-12 px-4 rounded-xl border-gray-200 focus:border-[#1e40af] focus:ring-[#1e40af] text-base"
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="h-12 px-4 rounded-xl border-gray-200 focus:border-[#1e40af] focus:ring-[#1e40af] text-base"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="h-12 px-4 rounded-xl border-gray-200 focus:border-[#1e40af] focus:ring-[#1e40af] text-base"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="h-12 px-4 rounded-xl border-gray-200 focus:border-[#1e40af] focus:ring-[#1e40af] text-base"
                placeholder="+237..."
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-12 px-4 pr-12 rounded-xl border-gray-200 focus:border-[#1e40af] focus:ring-[#1e40af] text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="h-12 px-4 pr-12 rounded-xl border-gray-200 focus:border-[#1e40af] focus:ring-[#1e40af] text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1 border-gray-300 data-[state=checked]:bg-[#1e40af] data-[state=checked]:border-[#1e40af]"
                required
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-700 cursor-pointer select-none leading-relaxed"
              >
                I agree to the{" "}
                <Link to="/terms" className="text-[#1e40af] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-[#1e40af] hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              disabled={!agreedToTerms || isSubmitting}
              className="w-full h-14 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-full text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? "Checking availability..." : "Create account"}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#1e40af] hover:text-[#1e3a8a] font-medium transition-colors"
              >
                Login Here
              </Link>
            </p>
          </form>
        </div>

        {/* Additional decorative element */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Verification Method Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 text-center mb-6">
              Choose Verification Method
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Verify by Phone */}
            <button
              onClick={() => handleVerificationMethod("phone")}
              className="w-full flex items-center gap-4 p-6 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
                <Phone className="w-6 h-6 text-[#1e40af]" />
              </div>
              <span className="text-lg font-medium text-gray-900">Verify by Phone</span>
            </button>

            {/* Verify by Email */}
            <button
              onClick={() => handleVerificationMethod("email")}
              className="w-full flex items-center gap-4 p-6 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
                <Mail className="w-6 h-6 text-[#1e40af]" />
              </div>
              <span className="text-lg font-medium text-gray-900">Verify by Email</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;

