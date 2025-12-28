import React, { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { fetchAdminLogs } from "../../../services/logs";
import { useUser } from "../../../contexts/userContext";
import { Search, Filter, X, Loader, FileText, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AdminLogs() {
  const { user } = useUser();

  const [logs, setLogs] = useState([]);
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
  const lastLogRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreLogs();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  useEffect(() => {
    fetchLogs(true);
  }, []);

  async function fetchLogs(isInitial = false) {
    if (!user?._id) return;

    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetchAdminLogs({
        userId: user?._id,
        search: filters.search,
        startDate: filters.startDate ? filters.startDate.toISOString() : "",
        endDate: filters.endDate ? filters.endDate.toISOString() : "",
        lastId: isInitial ? "" : filters.lastId,
        size: filters.size,
      });

      if (response?.success && response?.logs) {
        if (isInitial) {
          setLogs(response.logs);
        } else {
          setLogs((prev) => [...prev, ...response.logs]);
        }

        // Set hasMore based on backend response or data length
        setHasMore(response?.hasMore || response.logs.length === filters.size);

        // Update lastId for next fetch
        if (response.logs.length > 0) {
          setFilters((prev) => ({
            ...prev,
            lastId: response.logs[response.logs.length - 1]._id,
          }));
        }
      } else {
        toast.error(response?.message || "Failed to fetch logs");
      }
    } catch (error) {
      console.error("Fetch logs error:", error);
      toast.error(error?.message || "Something went wrong");
    } finally {
      if (isInitial) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }

  async function loadMoreLogs() {
    await fetchLogs(false);
  }

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, lastId: "" }));
    fetchLogs(true);
  };

  const handleReset = () => {
    setFilters({
      search: "",
      startDate: null,
      endDate: null,
      size: 20,
      lastId: "",
    });
    setTimeout(() => fetchLogs(true), 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionColor = (action) => {
    switch (action?.toUpperCase()) {
      case "CREATE":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      case "INVITE_SENT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelColor = (level) => {
    switch (level?.toUpperCase()) {
      case "INFO":
        return "bg-blue-50 text-blue-700";
      case "WARNING":
        return "bg-yellow-50 text-yellow-700";
      case "ERROR":
        return "bg-red-50 text-red-700";
      case "SUCCESS":
        return "bg-green-50 text-green-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#006ef5] mx-auto mb-3"></div>
          <p className="text-gray-600">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 flex items-center gap-2 text-[#006ef5]">
          <FileText color="#006ef5" className="mt-1" />
          Activity Logs
        </h1>
        <p className="text-gray-600">Track all activities and changes in your system</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Logs
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  placeholder="Search title or content"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006ef5] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div> */}

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
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
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006ef5] focus:ring-2 focus:ring-blue-100"
                  wrapperClassName="w-full"
                />
                {filters.startDate && (
                  <button
                    onClick={() => setFilters({ ...filters, startDate: null })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
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
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
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
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006ef5] focus:ring-2 focus:ring-blue-100"
                  wrapperClassName="w-full"
                />
                {filters.endDate && (
                  <button
                    onClick={() => setFilters({ ...filters, endDate: null })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
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

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No logs found
            </h3>
            <p className="text-gray-500">No activity logs match your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log, index) => {
                    if (logs.length === index + 1) {
                      return (
                        <tr
                          ref={lastLogRef}
                          key={log?._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-800">
                              {log?.title || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600 line-clamp-2">
                              {log?.content || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getActionColor(
                                log?.action
                              )}`}
                            >
                              {log?.action?.replace("_", " ") || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getLevelColor(
                                log?.level
                              )}`}
                            >
                              {log?.level || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(log?.createdAt)}
                          </td>
                        </tr>
                      );
                    } else {
                      return (
                        <tr
                          key={log?._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-800">
                              {log?.title || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600 line-clamp-2">
                              {log?.content || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getActionColor(
                                log?.action
                              )}`}
                            >
                              {log?.action?.replace("_", " ") || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getLevelColor(
                                log?.level
                              )}`}
                            >
                              {log?.level || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(log?.createdAt)}
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
              {logs.map((log, index) => {
                if (logs.length === index + 1) {
                  return (
                    <div
                      ref={lastLogRef}
                      key={log?._id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-800 flex-1">
                          {log?.title || "N/A"}
                        </p>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full capitalize ${getActionColor(
                            log?.action
                          )}`}
                        >
                          {log?.action?.replace("_", " ") || "N/A"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {log?.content || "N/A"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getLevelColor(
                            log?.level
                          )}`}
                        >
                          {log?.level || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(log?.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={log?._id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-800 flex-1">
                          {log?.title || "N/A"}
                        </p>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full capitalize ${getActionColor(
                            log?.action
                          )}`}
                        >
                          {log?.action?.replace("_", " ") || "N/A"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {log?.content || "N/A"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getLevelColor(
                            log?.level
                          )}`}
                        >
                          {log?.level || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(log?.createdAt)}
                        </span>
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
          <span className="text-gray-600">Loading more logs...</span>
        </div>
      )}

      {/* Results Info */}
      {logs.length > 0 && !hasMore && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing all {logs.length} log(s)
        </div>
      )}
    </div>
  );
}