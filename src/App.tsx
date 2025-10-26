import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import CompleteRegistration from "./pages/CompleteRegistration";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ConnectRooms from "./pages/ConnectRooms";
import RoomDashboard from "./pages/RoomDashboard";
import RoomSettings from "./pages/RoomSettings";
import RoomSubscriptionPlans from "./pages/RoomSubscriptionPlans";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionManage from "./pages/SubscriptionManage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Onboarding />} />
            <Route path="/pricing" element={<Index />} />
            <Route path="/subscription-plans" element={<SubscriptionPlans />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/complete-registration" element={<CompleteRegistration />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms"
              element={
                <ProtectedRoute>
                  <ConnectRooms />
                </ProtectedRoute>
              }
            />
                  <Route
                    path="/room/:roomId"
                    element={
                      <ProtectedRoute>
                        <RoomDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/room/:roomId/settings"
                    element={
                      <ProtectedRoute>
                        <RoomSettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/room/:roomId/subscription-plans"
                    element={
                      <ProtectedRoute>
                        <RoomSubscriptionPlans />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/room/:roomId/subscription-success"
                    element={
                      <ProtectedRoute>
                        <SubscriptionSuccess />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/room/:roomId/subscription-manage"
                    element={
                      <ProtectedRoute>
                        <SubscriptionManage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
