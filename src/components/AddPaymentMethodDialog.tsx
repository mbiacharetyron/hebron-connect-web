import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { subscriptionApi, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Initialize Stripe (you'll need to add your publishable key)
// For testing, use: pk_test_... (from your Stripe dashboard)
// For production, use: pk_live_... (from your Stripe dashboard)
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface AddPaymentMethodFormProps {
  roomId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function AddPaymentMethodForm({ roomId, onSuccess, onCancel }: AddPaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Stripe has not loaded yet. Please try again.",
      });
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Get setup intent from backend
      console.log("Creating setup intent for room:", roomId);
      const { client_secret, setup_intent_id } = await subscriptionApi.createSetupIntent(roomId);
      console.log("Setup intent created:", setup_intent_id);

      // Step 2: Confirm card setup with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      console.log("Confirming card setup with Stripe...");
      const { setupIntent, error } = await stripe.confirmCardSetup(client_secret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        console.error("Stripe error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to add payment method",
        });
      } else {
        console.log("Payment method added successfully:", setupIntent?.payment_method);
        toast({
          title: "Success",
          description: "Payment method added successfully!",
        });
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding payment method:", error);
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
          description: "Failed to add payment method. Please try again.",
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Card Information
          </label>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#1f2937",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    "::placeholder": {
                      color: "#9ca3af",
                    },
                  },
                  invalid: {
                    color: "#ef4444",
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                <strong className="text-blue-900">Secure payment</strong>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Your card information is encrypted and securely processed by Stripe.
                We never store your full card details.
              </p>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={processing || !stripe}
          className="bg-[#1e40af] hover:bg-[#1e3a8a] rounded-xl"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Add Card
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface AddPaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: number;
  onSuccess: () => void;
}

export function AddPaymentMethodDialog({
  open,
  onOpenChange,
  roomId,
  onSuccess,
}: AddPaymentMethodDialogProps) {
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a new card to your account for subscription payments
          </DialogDescription>
        </DialogHeader>

        <Elements stripe={stripePromise}>
          <AddPaymentMethodForm
            roomId={roomId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}

