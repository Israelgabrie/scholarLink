import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen,
  UserCheck,
  Trash2,
  Search,
  AlertCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import {
  getAllTeacherCourses,
  removeTeacherFromCourse,
} from "../../../services/course";
import { useUser } from "../../../contexts/userContext";

export default function CourseRights() {
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { user } = useUser();
  const observerTarget = useRef(null);

  const fetchTeacherAndCourses = async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const response = await getAllTeacherCourses({
        userId: user?._id,
        search: searchQuery,
        size: rowsPerPage,
        lastId: isInitial ? "" : lastId,
      });

      console.log("Fetch Response:", response);

      if (response?.success) {
        const newData = response?.data || [];

        if (isInitial) {
          setTeacherCourses(newData);
        } else {
          setTeacherCourses((prev) => [...prev, ...newData]);
        }

        setLastId(response?.nextLastId || "");
        setHasMore(!!response?.nextLastId && newData.length > 0);
      } else {
        toast.error(response?.message || "Failed to fetch teacher courses");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error?.message || "Failed to load data");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchTeacherAndCourses(true);
    }
  }, [user, rowsPerPage]);

  // Debounced search
  useEffect(() => {
    if (user?._id) {
      const timer = setTimeout(() => {
        setLastId("");
        fetchTeacherAndCourses(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries;
      if (target.isIntersecting && !isFetchingMore && hasMore) {
        fetchTeacherAndCourses(false);
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

  const openDeleteModal = (teacherId, courseId, teacherName, courseCode) => {
    setDeleteTarget({ teacherId, courseId, teacherName, courseCode });
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const { teacherId, courseId, teacherName, courseCode } = deleteTarget;

    try {
      setDeletingId(`${teacherId}-${courseId}`);

      const requestData = {
        userId: user?._id,
        teacherId: teacherId,
        courseId: courseId,
      };

      console.log("\n=================================");
      console.log("🗑️ DELETE REQUEST DATA");
      console.log("=================================");
      console.log("Request Payload:", JSON.stringify(requestData, null, 2));
      console.log("\n📋 Delete Details:");
      console.log("Teacher:", teacherName);
      console.log("Course:", courseCode);
      console.log("=================================\n");

      const response = await removeTeacherFromCourse(requestData);
      console.log("Delete Response:", response);

      if (response?.success) {
        toast.success(
          response?.message || "Teacher removed from course successfully!"
        );

        // Remove from state
        setTeacherCourses((prev) =>
          prev
            .map((item) => {
              if (item?.teacher?._id === teacherId) {
                return {
                  ...item,
                  courses:
                    item?.courses?.filter((c) => c?._id !== courseId) || [],
                };
              }
              return item;
            })
            .filter((item) => item?.courses?.length > 0)
        );

        closeDeleteModal();
      } else {
        toast.error(
          response?.message || "Failed to remove teacher from course"
        );
      }
    } catch (error) {
      console.error("Error removing teacher from course:", error);
      toast.error(error?.message || "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full">
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Removal
              </h3>
              <button
                onClick={closeDeleteModal}
                disabled={
                  deletingId ===
                  `${deleteTarget?.teacherId}-${deleteTarget?.courseId}`
                }
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove{" "}
              <span className="font-semibold">{deleteTarget?.teacherName}</span>{" "}
              from{" "}
              <span className="font-semibold">{deleteTarget?.courseCode}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={
                  deletingId ===
                  `${deleteTarget?.teacherId}-${deleteTarget?.courseId}`
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={
                  deletingId ===
                  `${deleteTarget?.teacherId}-${deleteTarget?.courseId}`
                }
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deletingId ===
                `${deleteTarget?.teacherId}-${deleteTarget?.courseId}` ? (
                  <>
                    <ClipLoader color="#ffffff" size={16} />
                    Removing...
                  </>
                ) : (
                  "Remove"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 flex items-center gap-2 text-[#006ef5]">
          <UserCheck color="#006ef5" className="mt-1" />
          Teacher Course Admins
        </h1>
        <p className="text-gray-600">
          View and manage teachers assigned as course admins
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-800">
              All Teacher Assignments
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
                  placeholder="Search teachers or courses..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <ClipLoader color="#006ef5" size={40} />
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Title
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teacherCourses?.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p>No teacher course assignments found</p>
                      </td>
                    </tr>
                  ) : (
                    teacherCourses?.map((item) =>
                      item?.courses?.map((course, index) => (
                        <tr
                          key={`${item?.teacher?._id}-${course?._id}`}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {index === 0 && (
                            <>
                              <td
                                className="px-6 py-4 whitespace-nowrap"
                                rowSpan={item?.courses?.length}
                              >
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                                    {item?.teacher?.profileImage ? (
                                      <img
                                        src={item?.teacher?.profileImage}
                                        alt={item?.teacher?.fullName}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-full w-full bg-[#006ef5] flex items-center justify-center">
                                        <span className="text-white font-semibold">
                                          {item?.teacher?.fullName
                                            ?.charAt(0)
                                            ?.toUpperCase()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {item?.teacher?.fullName || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap"
                                rowSpan={item?.courses?.length}
                              >
                                <span className="text-sm text-gray-600">
                                  {item?.teacher?.email || "N/A"}
                                </span>
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-[#006ef5]">
                              {course?.courseCode || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">
                              {course?.title || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button
                              onClick={() =>
                                openDeleteModal(
                                  item?.teacher?._id,
                                  course?._id,
                                  item?.teacher?.fullName,
                                  course?.courseCode
                                )
                              }
                              disabled={
                                deletingId ===
                                `${item?.teacher?._id}-${course?._id}`
                              }
                              className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>

              {/* Loading more indicator */}
              {isFetchingMore && (
                <div className="flex items-center justify-center py-4">
                  <ClipLoader color="#006ef5" size={30} />
                </div>
              )}

              {/* Infinite scroll trigger */}
              {hasMore && <div ref={observerTarget} className="h-4" />}
            </>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <ClipLoader color="#006ef5" size={40} />
            </div>
          ) : teacherCourses?.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p>No teacher course assignments found</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {teacherCourses?.map((item) => (
                  <div key={item?.teacher?._id} className="p-4">
                    {/* Teacher Info */}
                    <div className="mb-4 pb-3 border-b border-gray-200">
                      <div className="flex items-center mb-2">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                          {item?.teacher?.profileImage ? (
                            <img
                              src={item?.teacher?.profileImage}
                              alt={item?.teacher?.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-[#006ef5] flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {item?.teacher?.fullName
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {item?.teacher?.fullName || "N/A"}
                          </div>
                          <div className="text-xs text-gray-600">
                            {item?.teacher?.email || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Courses */}
                    <div className="space-y-3">
                      {item?.courses?.map((course) => (
                        <div
                          key={course?._id}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <BookOpen className="w-4 h-4 text-[#006ef5] flex-shrink-0" />
                                <span className="text-sm font-semibold text-[#006ef5]">
                                  {course?.courseCode}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 font-medium">
                                {course?.title}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                openDeleteModal(
                                  item?.teacher?._id,
                                  course?._id,
                                  item?.teacher?.fullName,
                                  course?.courseCode
                                )
                              }
                              disabled={
                                deletingId ===
                                `${item?.teacher?._id}-${course?._id}`
                              }
                              className="ml-2 text-red-600 hover:text-red-800 p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Loading more indicator */}
              {isFetchingMore && (
                <div className="flex items-center justify-center py-4">
                  <ClipLoader color="#006ef5" size={30} />
                </div>
              )}

              {/* Infinite scroll trigger */}
              {hasMore && <div ref={observerTarget} className="h-4" />}
            </>
          )}
        </div>

        {/* Table Footer */}
        <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing{" "}
            {teacherCourses?.reduce(
              (acc, item) => acc + (item?.courses?.length || 0),
              0
            ) || 0}{" "}
            assignments from {teacherCourses?.length || 0} teachers
          </p>
        </div>
      </div>
    </div>
  );
}
