import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { getTransaction } from "../../../services/paystack";
import { useUser } from "../../../contexts/userContext";
import { CheckCircle, XCircle, CreditCard, Calendar, Hash } from "lucide-react";
import appLogoImage from "../../../../public/img/appLogoImage.png";

export default function Transaction() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAndSetTrans() {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const trxref = searchParams.get("trxref");

        if (!trxref) {
          throw new Error("No transaction reference found");
        }

        const response = await getTransaction({
          userId: user._id,
          transactionId: trxref,
        });

        console.log(response);

        if (response?.success && response?.data) {
          setTransactionData(response.data);
        } else {
          toast.error(response?.message || "Failed to fetch transaction");
        }
      } catch (error) {
        console.error("Transaction fetch error:", error);
        setError(error?.message || "Something went wrong");
        toast.error(error?.message || "Failed to load transaction details");
      } finally {
        setLoading(false);
      }
    }
    fetchAndSetTrans();
  }, [location.search, user._id]);

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <img
            src={appLogoImage}
            alt="ScholarLink"
            className="h-16 w-auto mx-auto mb-4"
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#006ef5] mx-auto mb-3"></div>
          <p className="text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <img
            src={appLogoImage}
            alt="ScholarLink"
            className="h-12 w-auto mx-auto mb-4"
          />
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Transaction Failed
          </h2>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <button
            onClick={() => navigate("/payment")}
            className="w-full bg-gradient-to-r from-[#006ef5] to-[#0088ff] text-white py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Success State
  const formatAmount = (amount) => {
    return (amount / 100).toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const isSuccess = transactionData?.status === "success";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Logo */}
      {/* <div className="text-center mb-4">
        <img src={appLogoImage} alt="ScholarLink" className="h-12 w-auto mx-auto" />
      </div> */}

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Status Header */}
        <div
          className={`p-6 text-center ${
            isSuccess
              ? "bg-gradient-to-r from-green-500 to-green-600"
              : "bg-gradient-to-r from-red-500 to-red-600"
          }`}
        >
          <div className="bg-white rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            {isSuccess ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {isSuccess ? "Payment Successful!" : "Payment Failed"}
          </h1>
          <p className="text-white/90 text-sm">
            {isSuccess
              ? "Your transaction has been completed"
              : transactionData?.gateway_response ||
                "Transaction could not be completed"}
          </p>
        </div>

        {/* Amount */}
        <div className="p-6 text-center border-b border-gray-200">
          <p className="text-gray-500 text-sm mb-1">Amount Paid</p>
          <p className="text-3xl font-bold text-[#006ef5]">
            {formatAmount(transactionData?.amount)}
          </p>
        </div>

        {/* Details */}
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <Hash className="w-4 h-4 text-[#006ef5] mt-1" />
            <div>
              <p className="text-xs text-gray-500">Reference</p>
              <p className="font-semibold text-gray-800 text-sm">
                {transactionData?.reference}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-[#006ef5] mt-1" />
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-semibold text-gray-800 text-sm">
                {formatDate(
                  transactionData?.paid_at || transactionData?.created_at
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CreditCard className="w-4 h-4 text-[#006ef5] mt-1" />
            <div>
              <p className="text-xs text-gray-500">Payment Method</p>
              <p className="font-semibold text-gray-800 text-sm capitalize">
                {transactionData?.authorization?.brand} ****
                {transactionData?.authorization?.last4}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div
              className={`w-4 h-4 rounded-full mt-1 ${
                isSuccess ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p
                className={`font-semibold text-sm capitalize ${
                  isSuccess ? "text-green-600" : "text-red-600"
                }`}
              >
                {transactionData?.status}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex-1 bg-gradient-to-r from-[#006ef5] to-[#0088ff] text-white py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
          >
            Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-white border-2 border-[#006ef5] text-[#006ef5] py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-all text-sm"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
