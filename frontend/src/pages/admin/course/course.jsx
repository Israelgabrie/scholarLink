// CoursesPage.jsx
import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Edit2, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { createCourse, fetchCourse } from "../../../services/course";
import { useUser } from "../../../contexts/userContext";
import EditCourseModal from "./modals/editCourse";
import DeleteCourseModal from "./modals/deleteCourse";

export default function CoursesPage() {
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [lastId, setLastId] = useState("");
  const { user } = useUser();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const courseData = {
        userId: user?._id,
        courseCode,
        courseTitle,
        description,
      };

      console.log("Creating course with data:", courseData);

      const response = await createCourse(courseData);
      console.log("API Response:", response);

      if (response?.success) {
        toast.success(response?.message || "Course created successfully!");

        // Clear form after successful creation
        setCourseCode("");
        setCourseTitle("");
        setDescription("");

        // Add new course to the list without refetching
        if (response?.data) {
          setCourses((prev) => [response.data, ...prev]);
        } else {
          // Fallback: refetch if no data returned
          fetchCourses();
        }
      } else {
        toast.error(response?.message || "Failed to create course");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (course) => {
    setCurrentCourse(course);
    setEditModalOpen(true);
  };

  const handleEditSuccess = (updatedCourse) => {
    // Update the course in the list without refetching
    setCourses((prev) =>
      prev.map((course) =>
        course._id === updatedCourse._id ? updatedCourse : course
      )
    );
  };

  const handleDelete = (course) => {
    setCurrentCourse(course);
    setDeleteModal(true);
  };

  const handleDeleteSuccess = (deletedCourseId) => {
    // Remove the deleted course from the list
    setCourses((prev) =>
      prev.filter((course) => course._id !== deletedCourseId)
    );
  };

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await fetchCourse({
        userId: user?._id,
        search: searchQuery,
        size: rowsPerPage,
        lastId: lastId,
      });

      console.log("Fetch Courses Response:", response);

      if (response?.success) {
        setCourses(response?.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error(error?.message || "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchCourses();
    }
  }, [user, rowsPerPage]);

  // Debounced search
  useEffect(() => {
    if (user?._id) {
      const timer = setTimeout(() => {
        fetchCourses();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Filter courses based on search query (client-side filtering as backup)
  const filteredCourses =
    courses?.filter(
      (course) =>
        course?.courseCode
          ?.toLowerCase()
          ?.includes(searchQuery?.toLowerCase()) ||
        course?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        course?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    ) || [];

  // Truncate description function
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "N/A";
    if (text?.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="max-w-7xl mx-auto">
      <EditCourseModal
        isOpen={editModalOpen}
        setIsOpen={setEditModalOpen}
        data={currentCourse}
        onSuccess={handleEditSuccess}
      />

      <DeleteCourseModal
        isOpen={deleteModal}
        setIsOpen={setDeleteModal}
        data={currentCourse}
        onSuccess={handleDeleteSuccess}
      />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 flex items-center gap-2 text-[#006ef5]">
          <BookOpen color="#006ef5" className="mt-1" />
          Course Management
        </h1>
        <p className="text-gray-600">Create and manage your courses</p>
      </div>

      {/* Create Course Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#006ef5]" />
          Add New Course
        </h2>

        <form onSubmit={handleCreateCourse}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Course Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g., CS101"
                required
                disabled={isCreating}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Course Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="e.g., Introduction to Programming"
                required
                disabled={isCreating}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter course description..."
              required
              rows="4"
              disabled={isCreating}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreating}
            className="bg-[#006ef5] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#0052cc] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <ClipLoader color="#ffffff" size={20} />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create Course
              </>
            )}
          </button>
        </form>
      </div>

      {/* Courses Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-800">All Courses</h2>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Rows per page dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">
                  Show:
                </label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all text-sm flex-1"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
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
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses?.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No courses found
                    </td>
                  </tr>
                ) : (
                  filteredCourses?.map((course) => (
                    <tr
                      key={course?._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-[#006ef5]">
                          {course?.courseCode || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {course?.title || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-sm text-gray-600"
                          title={course?.description}
                        >
                          {truncateText(course?.description, 80)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div
                          onClick={() => handleEdit(course)}
                          className="text-[#006ef5] hover:text-[#0052cc] mr-4 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </div>
                        <div
                          onClick={() => handleDelete(course)}
                          className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <ClipLoader color="#006ef5" size={40} />
            </div>
          ) : filteredCourses?.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No courses found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCourses?.map((course) => (
                <div key={course?._id} className="p-4">
                  <div className="mb-3">
                    <span className="text-sm font-medium text-[#006ef5]">
                      {course?.courseCode || "N/A"}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900 mt-1">
                      {course?.title || "N/A"}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {truncateText(course?.description, 100)}
                  </p>
                  <div className="flex gap-3">
                    <div
                      onClick={() => handleEdit(course)}
                      className="flex-1 text-[#006ef5] hover:text-[#0052cc] py-2 px-4 border border-[#006ef5] rounded-lg font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </div>
                    <div
                      onClick={() => handleDelete(course)}
                      className="flex-1 text-red-600 hover:text-red-800 py-2 px-4 border border-red-600 rounded-lg font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Table Footer */}
        <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredCourses?.length || 0} of {courses?.length || 0}{" "}
            courses
          </p>
        </div>
      </div>
    </div>
  );
}
