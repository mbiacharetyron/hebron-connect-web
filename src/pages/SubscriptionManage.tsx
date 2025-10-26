import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Crown,
  CreditCard,
  Calendar,
  Check,
  Plus,
  MoreVertical,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { subscriptionApi, subscriptionPlansApi, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AddPaymentMethodDialog } from "@/components/AddPaymentMethodDialog";

interface Subscription {
  id: number;
  plan_name: string;
  plan_slug: string;
  status: string;
  starts_at: string;
  expires_at: string;
  days_remaining: number;
  amount_paid: string;
  payment_method: string;
  billing_cycle?: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  created: string;
  is_default?: boolean;
}

interface Plan {
  id: number;
  name: string;
  slug: string;
  monthly_price: string;
  annual_price?: string;
  formatted_monthly_price: string;
  formatted_annual_price?: string;
}

interface Invoice {
  id: string;
  number: string;
  status: string;
  amount_due: number;
  amount_paid: number;
  total: number;
  currency: string;
  created: string;
  due_date: string | null;
  period_start: string;
  period_end: string;
  invoice_pdf: string;
  hosted_invoice_url: string;
  customer_email: string;
  customer_name: string;
  description: string;
  subscription_id: string;
  paid: boolean;
  attempted: boolean;
}

const SubscriptionManage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "upgrade" | "downgrade" | "billing" | "pause" | "cancel" | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchSubscription = useCallback(async () => {
    if (!roomId) return;
    try {
      const data = await subscriptionApi.getSubscription(Number(roomId));
      setSubscription(data || null);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          // No subscription found
          setSubscription(null);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
        }
      }
    }
  }, [roomId, toast]);

  const fetchPaymentMethods = useCallback(async () => {
    if (!roomId) return;
    try {
      console.log("Fetching payment methods for room:", roomId);
      const data = await subscriptionApi.getPaymentMethods(Number(roomId));
      console.log("Payment methods API response:", data);
      
      // Handle different response structures
      const methods = data.payment_methods || data.data?.payment_methods || [];
      console.log("Extracted payment methods:", methods);
      
      // Map the payment methods and mark the default one
      const mappedMethods = methods.map((pm: any) => ({
        ...pm,
        is_default: pm.id === data.default_payment_method || pm.id === data.data?.default_payment_method,
      }));
      
      console.log("Mapped payment methods with default:", mappedMethods);
      setPaymentMethods(mappedMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      if (error instanceof ApiError) {
        console.error("API Error details:", {
          status: error.status,
          message: error.message,
        });
        // If 404 or similar, just set empty array
        if (error.status === 404 || error.status === 400) {
          setPaymentMethods([]);
        }
      }
    }
  }, [roomId]);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await subscriptionPlansApi.getAll();
      setAvailablePlans(response.plans || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    if (!roomId) return;
    setLoadingInvoices(true);
    try {
      console.log("Fetching invoices for room:", roomId);
      const data = await subscriptionApi.getInvoices(Number(roomId));
      console.log("Invoices data:", data);
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      if (error instanceof ApiError) {
        // If 404 or no subscription, just set empty array
        if (error.status === 404 || error.status === 400) {
          setInvoices([]);
        }
      }
    } finally {
      setLoadingInvoices(false);
    }
  }, [roomId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSubscription(), fetchPaymentMethods(), fetchPlans()]);
      setLoading(false);
      // Fetch invoices separately (not critical for initial load)
      fetchInvoices();
    };
    loadData();
  }, [fetchSubscription, fetchPaymentMethods, fetchPlans, fetchInvoices]);

  const handleSetDefaultCard = async (paymentMethodId: string) => {
    if (!roomId) return;
    try {
      await subscriptionApi.setDefaultPaymentMethod(Number(roomId), paymentMethodId);
      toast({
        title: "Success",
        description: "Default payment method updated",
        className: "bg-green-500 text-white",
      });
      fetchPaymentMethods();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    }
  };

  const handlePauseSubscription = async () => {
    if (!roomId) return;
    setIsProcessing(true);
    try {
      await subscriptionApi.pauseSubscription(Number(roomId));
      toast({
        title: "Success",
        description: "Subscription paused successfully",
        className: "bg-green-500 text-white",
      });
      fetchSubscription();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    } finally {
      setIsProcessing(false);
      setIsDialogOpen(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!roomId) return;
    setIsProcessing(true);
    try {
      await subscriptionApi.resumeSubscription(Number(roomId));
      toast({
        title: "Success",
        description: "Subscription resumed successfully",
        className: "bg-green-500 text-white",
      });
      fetchSubscription();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!roomId) return;
    setIsProcessing(true);
    try {
      await subscriptionApi.cancelSubscription(Number(roomId));
      toast({
        title: "Success",
        description: "Subscription cancelled. Access continues until end of period.",
        className: "bg-green-500 text-white",
      });
      fetchSubscription();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    } finally {
      setIsProcessing(false);
      setIsDialogOpen(false);
    }
  };

  const openDialog = (action: typeof selectedAction) => {
    setSelectedAction(action);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e40af]"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-lg sm:text-xl font-bold">Manage Subscription</h1>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Subscription</h2>
            <p className="text-gray-600 mb-6">
              Subscribe to a plan to unlock premium features for your connect room
            </p>
            <Button
              onClick={() => navigate(`/room/${roomId}/subscription-plans`)}
              className="bg-[#1e40af] hover:bg-[#1e3a8a] rounded-xl"
            >
              View Subscription Plans
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "suspended":
        return "bg-orange-500";
      case "cancelled":
        return "bg-red-500";
      case "expired":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 mr-3"
                onClick={() => navigate(`/room/${roomId}/settings`)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg sm:text-xl font-bold">Manage Subscription</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => {
                setLoading(true);
                Promise.all([fetchSubscription(), fetchPaymentMethods()]).finally(() =>
                  setLoading(false)
                );
              }}
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] flex items-center justify-center">
                <Crown className="w-7 h-7 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{subscription.plan_name}</h2>
                <Badge className={`${getStatusColor(subscription.status)} text-white mt-1`}>
                  {subscription.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Expires</span>
              </div>
              <p className="font-semibold text-gray-900">
                {new Date(subscription.expires_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {subscription.days_remaining} days remaining
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">Amount Paid</span>
              </div>
              <p className="font-semibold text-gray-900">{subscription.amount_paid}</p>
              <p className="text-sm text-gray-600 mt-1">{subscription.payment_method}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate(`/room/${roomId}/subscription-plans`)}
              className="bg-[#1e40af] hover:bg-[#1e3a8a] rounded-xl"
            >
              Change Plan
            </Button>

            {subscription.status === "active" && (
              <Button
                variant="outline"
                onClick={() => openDialog("pause")}
                className="rounded-xl"
              >
                Pause Subscription
              </Button>
            )}

            {subscription.status === "suspended" && (
              <Button
                onClick={handleResumeSubscription}
                className="bg-green-600 hover:bg-green-700 rounded-xl"
              >
                Resume Subscription
              </Button>
            )}

            {subscription.status === "active" && (
              <Button
                variant="destructive"
                onClick={() => openDialog("cancel")}
                className="rounded-xl"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Payment Methods</h3>
            <Button
              onClick={() => setIsAddCardDialogOpen(true)}
              variant="outline"
              className="rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No payment methods on file</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">
                        {pm.card.brand} •••• {pm.card.last4}
                      </p>
                      <p className="text-sm text-gray-600">
                        Expires {pm.card.exp_month}/{pm.card.exp_year}
                      </p>
                    </div>
                    {pm.is_default && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Default
                      </Badge>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!pm.is_default && (
                        <DropdownMenuItem onClick={() => handleSetDefaultCard(pm.id)}>
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600">Remove Card</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Billing History</h3>
          
          {loadingInvoices ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e40af] mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No billing history available</p>
              <p className="text-sm text-gray-500 mt-1">
                Invoices will appear here after your first payment
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-gray-900">
                        Invoice #{invoice.number}
                      </p>
                      <Badge
                        className={`${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : invoice.status === 'open'
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {invoice.status === 'paid' ? (
                          <><Check className="w-3 h-3 mr-1" /> Paid</>
                        ) : (
                          invoice.status
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {invoice.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {new Date(invoice.created).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(invoice.period_start).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        -{' '}
                        {new Date(invoice.period_end).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {invoice.currency.toUpperCase()} {invoice.total.toFixed(2)}
                      </p>
                      {invoice.amount_paid < invoice.total && (
                        <p className="text-xs text-red-600">
                          Due: {invoice.currency.toUpperCase()} {invoice.amount_due.toFixed(2)}
                        </p>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-lg">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          View Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Dialogs */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedAction === "pause" && "Pause Subscription?"}
              {selectedAction === "cancel" && "Cancel Subscription?"}
            </DialogTitle>
            <DialogDescription>
              {selectedAction === "pause" &&
                "Your subscription will be paused and billing will stop. You can resume anytime."}
              {selectedAction === "cancel" &&
                `Your subscription will be cancelled. You'll continue to have access until ${
                  subscription
                    ? new Date(subscription.expires_at).toLocaleDateString()
                    : ""
                }.`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                {selectedAction === "pause" &&
                  "No charges will occur while your subscription is paused."}
                {selectedAction === "cancel" && "This action cannot be easily undone."}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isProcessing}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={
                selectedAction === "pause" ? handlePauseSubscription : handleCancelSubscription
              }
              disabled={isProcessing}
              variant={selectedAction === "cancel" ? "destructive" : "default"}
              className="rounded-xl"
            >
              {isProcessing ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Method Dialog */}
      {roomId && (
        <AddPaymentMethodDialog
          open={isAddCardDialogOpen}
          onOpenChange={setIsAddCardDialogOpen}
          roomId={Number(roomId)}
          onSuccess={() => {
            fetchPaymentMethods();
            toast({
              title: "Success",
              description: "Payment method added successfully!",
            });
          }}
        />
      )}
    </div>
  );
};

export default SubscriptionManage;

