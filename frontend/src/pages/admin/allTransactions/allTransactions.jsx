import React, { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { getUserTransaction } from "../../../services/paystack";
import { useUser } from "../../../contexts/userContext";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, Filter, X, Loader } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AllTransactions() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    startDate: null,
    endDate: null,
    size: 20,
    lastId: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const observer = useRef();
  const lastTransactionRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreTransactions();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  useEffect(() => {
    fetchUserTransactions(true);
  }, []);

  async function fetchUserTransactions(isInitial = false) {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getUserTransaction({
        search: filters.search,
        userId: user?._id,
        startDate: filters.startDate ? filters.startDate.toISOString() : "",
        endDate: filters.endDate ? filters.endDate.toISOString() : "",
        lastId: isInitial ? "" : filters.lastId,
        size: filters.size,
      });

      if (response?.success && response?.data) {
        if (isInitial) {
          setTransactions(response.data);
        } else {
          toast.error(response?.message);
          setTransactions((prev) => [...prev, ...response.data]);
        }

        // Set hasMore based on backend response or data length
        setHasMore(response?.hasMore || response.data.length === filters.size);

        // Update lastId for next fetch
        if (response.data.length > 0) {
          setFilters((prev) => ({
            ...prev,
            lastId: response.data[response.data.length - 1]._id,
          }));
        }
      } else {
        toast.error(response?.message || "Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Fetch transactions error:", error);
      toast.error(error?.message || "Something went wrong");
    } finally {
      if (isInitial) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }

  async function loadMoreTransactions() {
    await fetchUserTransactions(false);
  }

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, lastId: "" }));
    fetchUserTransactions(true);
  };

  const handleReset = () => {
    setFilters({
      search: "",
      startDate: null,
      endDate: null,
      size: 20,
      lastId: "",
    });
    setTimeout(() => fetchUserTransactions(true), 100);
  };

  const formatAmount = (amount) => {
    return (amount / 1).toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRowClick = (reference) => {
    navigate(`/admin/transaction?trxref=${reference}&reference=${reference}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#006ef5] mx-auto mb-3"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 flex items-center gap-2 text-[#006ef5]">
          All Transactions
        </h1>
        <p className="text-gray-600">View and manage your payment history</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Filters</h2>
          <div
            onClick={() => setShowFilters(!showFilters)}
            className="text-[#006ef5] text-sm font-medium flex items-center gap-1 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide" : "Show"} Filters
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Reference
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  placeholder="Enter reference"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006ef5] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <DatePicker
                  selected={filters.startDate}
                  onChange={(date) =>
                    setFilters({ ...filters, startDate: date })
                  }
                  selectsStart
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  maxDate={filters.endDate || new Date()}
                  placeholderText="Select start date"
                  dateFormat="MMM dd, yyyy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006ef5] focus:ring-2 focus:ring-blue-100"
                  wrapperClassName="w-full"
                />
                {filters.startDate && (
                  <button
                    onClick={() => setFilters({ ...filters, startDate: null })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <DatePicker
                  selected={filters.endDate}
                  onChange={(date) => setFilters({ ...filters, endDate: date })}
                  selectsEnd
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  minDate={filters.startDate}
                  maxDate={new Date()}
                  placeholderText="Select end date"
                  dateFormat="MMM dd, yyyy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006ef5] focus:ring-2 focus:ring-blue-100"
                  wrapperClassName="w-full"
                />
                {filters.endDate && (
                  <button
                    onClick={() => setFilters({ ...filters, endDate: null })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Page Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Items per page
              </label>
              <select
                value={filters.size}
                onChange={(e) =>
                  setFilters({ ...filters, size: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006ef5] focus:ring-2 focus:ring-blue-100"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gradient-to-r from-[#006ef5] to-[#0088ff] text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
          >
            Apply Filters
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Type
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction, index) => {
                    if (transactions.length === index + 1) {
                      return (
                        <tr
                          ref={lastTransactionRef}
                          key={transaction._id}
                          onClick={() => handleRowClick(transaction.reference)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-800">
                              {transaction.reference}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-[#006ef5]">
                              {formatAmount(transaction.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                transaction.status === "success"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                            {transaction.metadata?.paymentType || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </td>
                        </tr>
                      );
                    } else {
                      return (
                        <tr
                          key={transaction._id}
                          onClick={() => handleRowClick(transaction.reference)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-800">
                              {transaction.reference}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-[#006ef5]">
                              {formatAmount(transaction.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                transaction.status === "success"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                            {transaction.metadata?.paymentType || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {transactions.map((transaction, index) => {
                if (transactions.length === index + 1) {
                  return (
                    <div
                      ref={lastTransactionRef}
                      key={transaction._id}
                      onClick={() => handleRowClick(transaction.reference)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-800 mb-1">
                            {transaction.reference}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.status === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-[#006ef5]">
                          {formatAmount(transaction.amount)}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={transaction._id}
                      onClick={() => handleRowClick(transaction.reference)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-800 mb-1">
                            {transaction.reference}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.status === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-[#006ef5]">
                          {formatAmount(transaction.amount)}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </>
        )}
      </div>

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex justify-center items-center py-6">
          <Loader className="w-6 h-6 text-[#006ef5] animate-spin mr-2" />
          <span className="text-gray-600">Loading more transactions...</span>
        </div>
      )}

      {/* Results Info */}
      {transactions.length > 0 && !hasMore && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing all {transactions.length} transaction(s)
        </div>
      )}
    </div>
  );
}
