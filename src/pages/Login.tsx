import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import logo from "@/assets/images/hConnect-logo3.png";
import { authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [credentials, setCredentials] = useState({
    emailOrPhone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.emailOrPhone || !credentials.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.login({
        login: credentials.emailOrPhone,
        password: credentials.password,
        device_type: "web",
        device_name: navigator.userAgent,
        lang: "en",
      });

      // Login user
      login(response.token, response.user);

      toast({
        title: "Success",
        description: "Login successful! Welcome back",
        className: "bg-green-500 text-white",
      });

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Login Failed",
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
              Welcome back!
            </h2>
            <p className="text-gray-600">Please login to continue</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email or Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="emailOrPhone" className="text-sm font-medium text-gray-700">
                Email or Phone Number
              </Label>
              <Input
                id="emailOrPhone"
                type="text"
                placeholder="Enter your Email or Phone Number"
                value={credentials.emailOrPhone}
                onChange={(e) =>
                  setCredentials({ ...credentials, emailOrPhone: e.target.value })
                }
                className="h-12 px-4 rounded-xl border-gray-200 focus:border-[#1e40af] focus:ring-[#1e40af] text-base"
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
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
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

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-gray-300 data-[state=checked]:bg-[#1e40af] data-[state=checked]:border-[#1e40af]"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-700 cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-[#1e40af] hover:text-[#1e3a8a] font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-full text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#1e40af] hover:text-[#1e3a8a] font-medium transition-colors"
              >
                Register Here
              </Link>
            </p>
          </form>
        </div>

        {/* Additional decorative element */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login;

