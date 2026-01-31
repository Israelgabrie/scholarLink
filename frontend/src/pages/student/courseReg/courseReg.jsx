"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen,
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { useUser } from "../../../contexts/userContext";
import { fetchCoursesForRegistration } from "../../../services/course";

export default function CourseRegistration() {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastId, setLastId] = useState("");
  const observerTarget = useRef(null);

  const [formData, setFormData] = useState({
    semester: "",
    session: user?.school?.currentSession || "",
  });

  const [availableCourses, setAvailableCourses] = useState([]);

  useEffect(() => {
    if (user?.school?.currentSession) {
      setFormData((prev) => ({
        ...prev,
        session: user.school.currentSession,
      }));
    }
  }, [user]);

  // Fetch courses function
  const fetchCourses = async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const params = {
        userId: user?._id,
        search: searchQuery,
        size: rowsPerPage,
        lastId: isInitial ? "" : lastId,
      };

      console.log("Fetch Parameters:", params);

      const response = await fetchCoursesForRegistration(params);
      console.log("Fetch Response:", response);

      if (response?.success) {
        const newData = response?.courses || [];

        if (isInitial) {
          setAvailableCourses(newData);
        } else {
          setAvailableCourses((prev) => [...prev, ...newData]);
        }

        setLastId(response?.nextLastId || "");
        setHasMore(response?.hasMore || false);
      } else {
        toast.error(response?.message || "Failed to load courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchCourses(true);
    }
  }, [user, rowsPerPage]);

  // Debounced search
  useEffect(() => {
    if (user?._id) {
      const timer = setTimeout(() => {
        setLastId("");
        fetchCourses(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries;
      if (target.isIntersecting && !isFetchingMore && hasMore) {
        fetchCourses(false);
      }
    },
    [isFetchingMore, hasMore, lastId]
  );

  useEffect(() => {
    const element = observerTarget.current;
    const option = { threshold: 0 };

    const observer = new IntersectionObserver(handleObserver, option);
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  const handleCourseToggle = (courseId) => {
    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleRemoveCourse = (courseId) => {
    setSelectedCourses((prev) => prev.filter((id) => id !== courseId));
  };

  const totalUnits = availableCourses
    .filter((course) => selectedCourses.includes(course.id))
    .reduce((sum, course) => sum + (course.units || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.semester) {
      toast.error("Please enter semester/term");
      return;
    }

    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course");
      return;
    }

    setIsSubmitting(true);

    try {
      const registrationData = {
        userId: user?._id,
        semester: formData.semester,
        session: formData.session,
        courses: selectedCourses,
        totalUnits,
      };

      console.log("\n=================================");
      console.log("📝 COURSE REGISTRATION REQUEST");
      console.log("=================================");
      console.log("Request Body:", JSON.stringify(registrationData, null, 2));
      console.log("=================================\n");

      // Replace with actual API call
      // const response = await submitCourseRegistration(registrationData);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Course registration submitted successfully!");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 flex items-center gap-2 text-[#006ef5]">
          <BookOpen color="#006ef5" className="mt-1" />
          Course Registration
        </h1>
        <p className="text-gray-600">
          Register your courses for the current semester
        </p>
      </div>

      {/* Selected Courses Summary */}
      {selectedCourses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-blue-900">
              Selected Courses ({selectedCourses.length})
            </h3>
            <span className="text-sm font-medium text-blue-700">
              Total Units: {totalUnits}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableCourses
              .filter((course) => selectedCourses.includes(course.id))
              .map((course) => (
                <div
                  key={course.id}
                  className="inline-flex items-center gap-2 bg-white border border-blue-300 rounded-lg px-3 py-1.5 text-sm"
                >
                  <span className="font-semibold text-[#006ef5]">
                    {course.courseCode || course.courseTitle}
                  </span>
                  <button
                    onClick={() => handleRemoveCourse(course.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Registration Info Section */}
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Registration Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SESSION (DISABLED) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Session
              </label>
              <input
                type="text"
                value={formData.session}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-sm"
              />
            </div>

            {/* SEMESTER/TERM */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester/Term <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) =>
                  setFormData({ ...formData, semester: e.target.value })
                }
                placeholder="e.g., First Semester"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Available Courses
            </h2>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Rows per page dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">
                  Show:
                </label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setLastId("");
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all w-full sm:w-64 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <ClipLoader color="#006ef5" size={40} />
            </div>
          ) : availableCourses.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No courses available</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {availableCourses.map((course) => {
                  const isSelected = selectedCourses.includes(course.id);

                  return (
                    <div
                      key={course.id}
                      onClick={() => handleCourseToggle(course.id)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-[#006ef5] bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-[#006ef5] hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* CHECKBOX */}
                        <div
                          className={`h-6 w-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                            isSelected
                              ? "bg-[#006ef5] border-[#006ef5]"
                              : "border-gray-400"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle className="h-5 w-5 text-white" />
                          )}
                        </div>

                        {/* COURSE INFO */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 text-sm">
                              {course.courseCode || "N/A"}
                            </span>
                            <span className="text-gray-600">-</span>
                            <span className="text-gray-700 text-sm">
                              {course.courseTitle || "N/A"}
                            </span>
                          </div>
                          {course.units && (
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span>{course.units} Units</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Loading more indicator */}
              {isFetchingMore && (
                <div className="flex items-center justify-center py-4 mt-4">
                  <ClipLoader color="#006ef5" size={30} />
                </div>
              )}

              {/* Infinite scroll trigger */}
              {hasMore && <div ref={observerTarget} className="h-4" />}
            </>
          )}
        </div>

        {/* Footer with Submit */}
        <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{selectedCourses.length}</span>{" "}
            courses selected • <span className="font-medium">{totalUnits}</span>{" "}
            total units
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedCourses.length === 0}
            className="px-6 py-2.5 bg-[#006ef5] text-white rounded-lg font-medium hover:bg-[#0052cc] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 shadow-md text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Submit Registration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}