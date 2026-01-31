import React, { useState, useEffect } from "react";
import { BookOpen, UserCheck, Send, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { fetchTeacgerAndCourses } from "../../../services/adminUsers";
import { useUser } from "../../../contexts/userContext";
import { setTeacherCourseAdmin } from "../../../services/course";

export default function AssignCourses() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const response = await fetchTeacgerAndCourses({
          userId: user?._id,
        });

        console.log("API Response:", response);

        if (response?.success) {
          setTeachers(response?.data?.teachers || []);
          setCourses(response?.data?.courses || []);
          toast.success(response?.message || "Data loaded successfully!");
        } else {
          toast.error(response?.message || "Failed to load teachers and courses");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error?.message || "Failed to load data");
        setIsLoading(false);
      }
    };

    if (user?._id) {
      fetchData();
    }
  }, [user]);

  const handleCourseToggle = (courseId) => {
    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTeacher) {
      toast.error("Please select a teacher");
      return;
    }

    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course");
      return;
    }

    try {
      setIsSubmitting(true);

      const requestData = {
        userId: user?._id,
        teacherId: selectedTeacher,
        courseIds: selectedCourses,
        timestamp: new Date().toISOString(),
      };

      console.log("\n=================================");
      console.log("📤 BACKEND REQUEST DATA");
      console.log("=================================");
      console.log("Request Payload:", JSON.stringify(requestData, null, 2));
      console.log("\n📋 Selected Teacher Details:");
      console.log(teachers.find((t) => t._id === selectedTeacher));
      console.log("\n📚 Selected Courses Details:");
      console.log(courses.filter((c) => selectedCourses.includes(c._id)));
      console.log("=================================\n");

      const response = await setTeacherCourseAdmin(requestData);
      console.log("API Response:", response);

      if (response?.success) {
        toast.success(response?.message || "Courses assigned successfully!");
        
        // Reset form
        setSelectedTeacher("");
        setSelectedCourses([]);
      } else {
        toast.error(response?.message || "Failed to assign courses");
      }
    } catch (error) {
      console.error("Error assigning courses:", error);
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedTeacherName = () => {
    const teacher = teachers.find((t) => t._id === selectedTeacher);
    return teacher ? teacher.fullName : "Select a teacher";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <ClipLoader color="#006ef5" size={50} />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 flex items-center gap-2 text-[#006ef5]">
          <UserCheck color="#006ef5" className="mt-1" />
          Assign Courses to Teacher
        </h1>
        <p className="text-gray-600">
          Select a teacher and assign courses they can upload results for
        </p>
      </div>

      {/* Assignment Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div>
          {/* Teacher Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Teacher <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Choose a teacher...</option>
                {teachers.map((teacher) => (
                  <option key={teacher?._id} value={teacher?._id}>
                    {teacher?.fullName} - {teacher?.email}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Selected Teacher Info */}
          {selectedTeacher && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Selected:</span>{" "}
                {getSelectedTeacherName()}
              </p>
            </div>
          )}

          {/* Course Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Courses <span className="text-red-500">*</span>
              <span className="ml-2 text-xs text-gray-500 font-normal">
                ({selectedCourses.length} selected)
              </span>
            </label>

            {courses.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No courses available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {courses.map((course) => {
                  const isSelected = selectedCourses.includes(course?._id);
                  return (
                    <div
                      key={course?._id}
                      onClick={() =>
                        !isSubmitting && handleCourseToggle(course?._id)
                      }
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#006ef5] bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
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
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ml-2 transition-all ${
                            isSelected
                              ? "bg-[#006ef5] border-[#006ef5]"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Courses Summary */}
          {selectedCourses.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Selected Courses ({selectedCourses.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCourses.map((courseId) => {
                  const course = courses.find((c) => c?._id === courseId);
                  return (
                    <span
                      key={courseId}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-green-300 rounded-full text-xs font-medium text-gray-700"
                    >
                      {course?.courseCode}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseToggle(courseId);
                        }}
                        disabled={isSubmitting}
                        className="ml-1 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting || 
                !selectedTeacher || 
                selectedCourses.length === 0 || 
                teachers.length === 0 || 
                courses.length === 0
              }
              className="flex-1 bg-[#006ef5] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0052cc] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <ClipLoader color="#ffffff" size={20} />
                  Assigning...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Assign Courses
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Note:</span> Once assigned, the
          selected teacher will be able to upload student results for these
          courses.
        </p>
      </div>
    </div>
  );
}