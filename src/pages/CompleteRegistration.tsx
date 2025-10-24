import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const CompleteRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const { verification_token, identifier, type } = location.state || {};

  useEffect(() => {
    const completeRegistration = async () => {
      if (!verification_token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Missing verification token",
        });
        navigate("/register");
        return;
      }

      // Get registration data from sessionStorage
      const registrationDataStr = sessionStorage.getItem("registration_data");
      if (!registrationDataStr) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Registration data not found",
        });
        navigate("/register");
        return;
      }

      const registrationData = JSON.parse(registrationDataStr);

      try {
        const response = await authApi.register({
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          email: registrationData.email,
          phone: registrationData.phoneNumber,
          password: registrationData.password,
          password_confirmation: registrationData.confirmPassword,
          identifier_type: type,
        });

        // Clear registration data
        sessionStorage.removeItem("registration_data");

        // Login user
        login(response.token, response.user);

        toast({
          title: "Success",
          description: "Registration successful! Welcome to Hebron Connect",
          className: "bg-green-500 text-white",
        });

        // Navigate to dashboard or home
        navigate("/dashboard");
      } catch (error) {
        if (error instanceof ApiError) {
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: error.message,
          });
        }
        navigate("/register");
      }
    };

    completeRegistration();
  }, [verification_token, type, navigate, login, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-16 h-16 animate-spin text-[#1e40af] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Completing Registration
        </h2>
        <p className="text-gray-600">Please wait while we set up your account...</p>
      </div>
    </div>
  );
};

export default CompleteRegistration;

