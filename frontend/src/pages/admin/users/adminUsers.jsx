import React, { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { fetchAdminUsers } from "../../../services/adminUsers";
import { useUser } from "../../../contexts/userContext";
import { Filter, X, Loader, Users, Mail, Hash, User as UserIcon } from "lucide-react";

export default function AdminUsers() {
  const { user } = useUser();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState({
    fullName: "",
    role: "",
    email: "",
    matricNumber: "",
    size: 30,
    lastId: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const observer = useRef();
  const lastUserRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreUsers();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  useEffect(() => {
    fetchUsers(true);
  }, []);

  async function fetchUsers(isInitial = false) {
    if (!user?._id) return;

    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetchAdminUsers({
        userId: user?._id,
        fullName: filters.fullName,
        role: filters.role,
        email: filters.email,
        matricNumber: filters.matricNumber,
        lastId: isInitial ? "" : filters.lastId,
        size: filters.size,
      });

      if (response?.success && response?.data) {
        if (isInitial) {
          setUsers(response.data);
        } else {
          setUsers((prev) => [...prev, ...response.data]);
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
        toast.error(response?.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      toast.error(error?.message || "Something went wrong");
    } finally {
      if (isInitial) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }

  async function loadMoreUsers() {
    await fetchUsers(false);
  }

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, lastId: "" }));
    fetchUsers(true);
  };

  const handleReset = () => {
    setFilters({
      fullName: "",
      role: "",
      email: "",
      matricNumber: "",
      size: 30,
      lastId: "",
    });
    setTimeout(() => fetchUsers(true), 100);
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

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "teacher":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVerifiedColor = (verified) => {
    return verified
      ? "bg-green-50 text-green-700"
      : "bg-red-50 text-red-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#006ef5] mx-auto mb-3"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 flex items-center gap-2 text-[#006ef5]">
          <Users color="#006ef5" className="mt-1" />
          Users Management
        </h1>
        <p className="text-gray-600">View and manage all users in your system</p>
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
            {/* Full Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <input
                  type="text"
                  value={filters.fullName}
                  onChange={(e) =>
                    setFilters({ ...filters, fullName: e.target.value })
                  }
                  placeholder="Search by name"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006ef5] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) =>
                  setFilters({ ...filters, role: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006ef5] focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            {/* Email Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <input
                  type="email"
                  value={filters.email}
                  onChange={(e) =>
                    setFilters({ ...filters, email: e.target.value })
                  }
                  placeholder="Filter by email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006ef5] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Matric Number Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matric Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <input
                  type="text"
                  value={filters.matricNumber}
                  onChange={(e) =>
                    setFilters({ ...filters, matricNumber: e.target.value })
                  }
                  placeholder="Filter by matric number"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006ef5] focus:ring-2 focus:ring-blue-100"
                />
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

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-500">No users match your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matric No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      School
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((userData, index) => {
                    if (users.length === index + 1) {
                      return (
                        <tr
                          ref={lastUserRef}
                          key={userData?._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={userData?.profileImage || "https://via.placeholder.com/40"}
                                alt={userData?.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <span className="text-sm font-medium text-gray-800">
                                {userData?.fullName || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {userData?.email || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getRoleColor(
                                userData?.role
                              )}`}
                            >
                              {userData?.role || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {userData?.matricNumber || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getVerifiedColor(
                                userData?.verified
                              )}`}
                            >
                              {userData?.verified ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          {/* <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {userData?.school?.name || "N/A"}
                            </span>
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(userData?.createdAt)}
                          </td>
                        </tr>
                      );
                    } else {
                      return (
                        <tr
                          key={userData?._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={userData?.profileImage || "https://via.placeholder.com/40"}
                                alt={userData?.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <span className="text-sm font-medium text-gray-800">
                                {userData?.fullName || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {userData?.email || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getRoleColor(
                                userData?.role
                              )}`}
                            >
                              {userData?.role || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {userData?.matricNumber || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getVerifiedColor(
                                userData?.verified
                              )}`}
                            >
                              {userData?.verified ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          {/* <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {userData?.school?.name || "N/A"}
                            </span>
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(userData?.createdAt)}
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
              {users.map((userData, index) => {
                if (users.length === index + 1) {
                  return (
                    <div
                      ref={lastUserRef}
                      key={userData?._id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={userData?.profileImage || "https://via.placeholder.com/40"}
                          alt={userData?.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {userData?.fullName || "N/A"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {userData?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRoleColor(
                            userData?.role
                          )}`}
                        >
                          {userData?.role || "N/A"}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getVerifiedColor(
                            userData?.verified
                          )}`}
                        >
                          {userData?.verified ? "Verified" : "Unverified"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        {userData?.matricNumber && (
                          <p>Matric: {userData?.matricNumber}</p>
                        )}
                        <p>School: {userData?.school?.name || "N/A"}</p>
                        <p>Joined: {formatDate(userData?.createdAt)}</p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={userData?._id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={userData?.profileImage || "https://via.placeholder.com/40"}
                          alt={userData?.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {userData?.fullName || "N/A"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {userData?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRoleColor(
                            userData?.role
                          )}`}
                        >
                          {userData?.role || "N/A"}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getVerifiedColor(
                            userData?.verified
                          )}`}
                        >
                          {userData?.verified ? "Verified" : "Unverified"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        {userData?.matricNumber && (
                          <p>Matric: {userData?.matricNumber}</p>
                        )}
                        <p>School: {userData?.school?.name || "N/A"}</p>
                        <p>Joined: {formatDate(userData?.createdAt)}</p>
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
          <span className="text-gray-600">Loading more users...</span>
        </div>
      )}

      {/* Results Info */}
      {users.length > 0 && !hasMore && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing all {users.length} user(s)
        </div>
      )}
    </div>
  );
}