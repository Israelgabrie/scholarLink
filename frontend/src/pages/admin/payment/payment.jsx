import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Shield, Lock, CreditCard, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { fetchEnum } from "../../../services/enum";
import { useUser } from "../../../contexts/userContext";
import { startPayment } from "../../../services/paystack";

export default function PaymentPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    async function fetchEnumValues() {
      try {
        console.log(user);
        setIsLoading(true);
        setError(null);
        const response = await fetchEnum();

        if (response?.success) {
          const amountFromBackend = response?.data?.values || 5000;

          setPaymentData({
            serviceName: "ScholarLink Premium Access",
            amount: amountFromBackend,
            currency: "NGN",
            description: "Annual subscription for full platform access",
            features: [
              "Access to all academic resources",
              "Connect with unlimited scholars",
              "Priority support and assistance",
              "Exclusive webinars and events",
              "Advanced analytics and insights",
            ],
            billingCycle: "Annual",
            nextBillingDate: "December 26, 2026",
          });
        } else {
          toast.error(response?.message || "Failed to fetch payment information");
        }
        setIsLoading(false);
      } catch (error) {
        setError(error?.message || "Failed to load payment information");
        toast.error(error?.message || "Something went wrong");
        setIsLoading(false);
      }
    }

    fetchEnumValues();
  }, []);

  const handlePayment = async () => {
    if (!paymentData || !user?._id) {
      toast.error("Missing required information");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await startPayment({
        userId: user?._id,
        paymentType: "basicPlan",
        email: user?.email,
      });

      console.log("Paystack response:", response);

      if (response?.success && response?.authorization_url) {
        window.location.href = response?.authorization_url;
        toast.success("Redirecting to Paystack checkout...");
      } else {
        toast.error(
          response?.message || "Failed to initiate payment. Try again."
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error?.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // ERROR STATE
  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-20">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-4 rounded-full">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error || "N/A"}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-[#006ef5] text-white rounded-lg font-semibold hover:bg-[#0052cc] transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 flex items-center gap-2 text-[#006ef5]">
          <CreditCard color="#006ef5" className="mt-1" />
          Make Payment
        </h1>
        <p className="text-gray-600">
          Complete your payment to unlock premium features
        </p>
      </div>

      {/* Payment Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-[#006ef5]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Payment Amount
                </h2>
                <p className="text-sm text-gray-500">One-time payment</p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center gap-3 py-4">
                <ClipLoader color="#006ef5" size={30} />
                <span className="text-gray-500">Loading amount...</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#006ef5]">
                  {paymentData?.currency || "NGN"} {paymentData?.amount || "N/A"}
                </span>
                <span className="text-gray-500">
                  / {paymentData?.billingCycle || "N/A"}
                </span>
              </div>
            )}
          </div>

          {/* Service Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              What You're Getting
            </h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <ClipLoader color="#006ef5" size={40} />
              </div>
            ) : (
              <>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {paymentData?.serviceName || "N/A"}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {paymentData?.description || "N/A"}
                  </p>
                </div>

                <div className="space-y-3">
                  {paymentData?.features?.length > 0 ? (
                    paymentData.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="bg-green-100 rounded-full p-1 mt-0.5">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">{feature || "N/A"}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No features available</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Summary
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <ClipLoader color="#006ef5" size={40} />
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subscription</span>
                    <span className="font-medium text-gray-800">
                      {paymentData?.currency || "NGN"} {paymentData?.amount || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Billing Cycle</span>
                    <span className="font-medium text-gray-800">
                      {paymentData?.billingCycle || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Next Billing</span>
                    <span className="font-medium text-gray-800">
                      {paymentData?.nextBillingDate || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="text-lg font-semibold text-gray-800">
                    Total
                  </span>
                  <span className="text-lg font-bold text-[#006ef5]">
                    {paymentData?.currency || "NGN"} {paymentData?.amount || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mb-4 pb-4 border-b border-gray-200">
                  <Shield className="w-4 h-4" />
                  <span>Secure payment</span>
                  <Lock className="w-4 h-4" />
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !paymentData}
                  className="w-full bg-gradient-to-r from-[#006ef5] to-[#0088ff] text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-3"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <ClipLoader color="#ffffff" size={20} />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Pay Now`
                  )}
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="w-full text-gray-500 hover:text-gray-700 text-sm transition-colors"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}