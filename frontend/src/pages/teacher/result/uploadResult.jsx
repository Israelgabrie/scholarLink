import React, { useEffect, useState } from "react";
import { Upload, BookOpen, Calendar, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import ManualEntryTab from "./components/ManualEntryTab";
import ExcelUploadTab from "./components/ExcelUploadTab";
import { fetchUploadResultData, uploadResult } from "../../../services/result";
import { useUser } from "../../../contexts/userContext";

export default function UploadResultsPage() {
  const { user } = useUser();

  // Course, Session, and Term Selection
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState("manual");

  // Student Selection
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Excel File
  const [excelFile, setExcelFile] = useState(null);
  const [uploadedResults, setUploadedResults] = useState([]);

  // Students State
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  // Loading States
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Term options
  const termOptions = ["FIRST", "SECOND", "THIRD"];

  // Fetch courses and students on mount
  useEffect(() => {
    if (user?._id) {
      fetchData();
    }
  }, [user?._id]);

  const fetchData = async (filters = {}) => {
    if (!user?._id) {
      console.error("User ID not available");
      setLoadingData(false);
      return;
    }

    try {
      setLoadingData(true);

      const requestData = {
        userId: user._id,
        search: filters.search || "",
        lastId: filters.lastId || "",
        className: filters.className || "",
        session: filters.session || "",
        department: filters.department || "",
        program: filters.program || "",
        courseSearch: filters.courseSearch || "",
        size: 30,
      };

      console.log("📤 Fetching data with params:", requestData);

      const response = await fetchUploadResultData(requestData);

      console.log("📥 Fetch data response:", response);

      if (response?.success) {
        setCourses(response.courses || []);
        setStudents(response.students || []);
        setAllStudents(response.students || []);

        console.log(
          `✅ Loaded ${response.courses?.length || 0} courses and ${response.students?.length || 0} students`,
        );

        if (response.courses?.length === 0) {
          toast.info("No courses found");
        }
      } else {
        const errorMessage = response?.message || "Failed to load data";
        console.error("❌ API Error:", errorMessage, response);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load courses and students",
      );
    } finally {
      setLoadingData(false);
    }
  };

  // Handle course search
  const handleCourseSearch = () => {
    console.log("🔍 Searching courses with:", courseSearch);
    fetchData({ courseSearch });
  };

  // Submit Results
  const handleSubmitResults = async () => {
    // Validation
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    if (!selectedSession) {
      toast.error("Please select a session");
      return;
    }

    if (!selectedTerm) {
      toast.error("Please select a term");
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === "manual") {
        // Manual Entry Validation
        if (selectedStudents.length === 0) {
          toast.error("Please select at least one student");
          setIsSubmitting(false);
          return;
        }

        // Get only selected students with their scores
        const resultsToSubmit = students
          .filter((student) => selectedStudents.includes(student._id))
          .map((student) => ({
            studentId: student._id,
            matricNumber: student.matricNumber,
            studentName: student.fullName,
            className: student.className,
            department: student.department,
            program: student.program,
            session: selectedSession,
            term: selectedTerm,
            testScore: parseFloat(student.testScore) || 0,
            examScore: parseFloat(student.examScore) || 0,
            totalScore:
              (parseFloat(student.testScore) || 0) +
              (parseFloat(student.examScore) || 0),
          }));

        // Prepare payload
        const payload = {
          userId: user._id,
          courseId: selectedCourse,
          teacherId: user._id,
          schoolId: user?.school?._id || user?.school,
          session: selectedSession,
          term: selectedTerm,
          uploadMethod: "manual",
          results: resultsToSubmit,
          uploadDate: new Date().toISOString(),
        };

        console.log(
          "📤 MANUAL UPLOAD PAYLOAD:",
          JSON.stringify(payload, null, 2),
        );

        // API Call
        const response = await uploadResult(payload);

        console.log("📥 Manual upload response:", response);

        if (response?.success) {
          toast.success(
            response?.message ||
              `Results uploaded successfully for ${resultsToSubmit.length} students!`,
          );

          // Reset after successful submission
          setSelectedStudents([]);
          setSelectedCourse("");
          setSelectedSession("");
          setSelectedTerm("");

          // Reset student scores
          setStudents(
            students.map((s) => ({ ...s, testScore: "", examScore: "" })),
          );
        } else {
          const errorMessage = response?.message || "Failed to upload results";
          console.error("❌ Upload error:", errorMessage, response);
          toast.error(errorMessage);
        }
      } else {
        // Excel Upload Validation
        if (!excelFile || uploadedResults.length === 0) {
          toast.error("Please upload an Excel file with results");
          setIsSubmitting(false);
          return;
        }

        // Prepare payload
        const payload = {
          userId: user._id,
          courseId: selectedCourse,
          teacherId: user._id,
          schoolId: user?.school?._id || user?.school,
          session: selectedSession,
          term: selectedTerm,
          uploadMethod: "excel",
          results: uploadedResults.map((result) => ({
            matricNumber: result.matricNumber,
            session: selectedSession,
            term: selectedTerm,
            testScore: parseFloat(result.testScore) || 0,
            examScore: parseFloat(result.examScore) || 0,
            totalScore:
              (parseFloat(result.testScore) || 0) +
              (parseFloat(result.examScore) || 0),
          })),
          fileName: excelFile.name,
          uploadDate: new Date().toISOString(),
        };

        console.log(
          "📤 EXCEL UPLOAD PAYLOAD:",
          JSON.stringify(payload, null, 2),
        );

        // API Call
        const response = await uploadResult(payload);

        console.log("📥 Excel upload response:", response);

        if (response?.success) {
          toast.success(
            response?.message ||
              `Results uploaded successfully for ${uploadedResults.length} students!`,
          );

          // Reset after successful submission
          setExcelFile(null);
          setUploadedResults([]);
          setSelectedCourse("");
          setSelectedSession("");
          setSelectedTerm("");
        } else {
          const errorMessage = response?.message || "Failed to upload results";
          console.error("❌ Upload error:", errorMessage, response);
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("❌ Error uploading results:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to upload results",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 flex items-center gap-2 text-[#006ef5]">
          <Upload className="w-7 h-7" />
          Upload Results
        </h1>
        <p className="text-gray-600">
          Upload student test and exam scores for courses
        </p>
      </div>

      {loadingData ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <ClipLoader color="#006ef5" size={40} />
            <p className="text-gray-600 mt-4">
              Loading courses and students...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Course, Session, and Term Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#006ef5]" />
              Result Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Selection with Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  Select Course
                </label>

                {/* Course Search */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCourseSearch();
                      }
                    }}
                    placeholder="Search by course code, title, or description"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all"
                  />
                  <button
                    onClick={handleCourseSearch}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Search
                  </button>
                </div>

                {/* Course Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <div
                        key={course._id}
                        onClick={() => setSelectedCourse(course._id)}
                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                          selectedCourse === course._id
                            ? "border-[#006ef5] bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {course.courseCode}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {course.title}
                            </p>
                          </div>
                          {selectedCourse === course._id && (
                            <div className="w-5 h-5 bg-[#006ef5] rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">
                        No courses found. Try adjusting your search.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Session Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Session
                </label>
                <input
                  type="text"
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  placeholder="e.g., 2024/2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Term Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Term
                </label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select term</option>
                  {termOptions.map((term) => (
                    <option key={term} value={term}>
                      {term} TERM
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Summary */}
            {(selectedCourse || selectedSession || selectedTerm) && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  Selected:{" "}
                  {selectedCourse &&
                    courses.find((c) => c._id === selectedCourse)
                      ?.courseCode}{" "}
                  {selectedSession && `• ${selectedSession}`}{" "}
                  {selectedTerm && `• ${selectedTerm} TERM`}
                </p>
              </div>
            )}
          </div>

          {/* Upload Method Tabs */}
          {selectedCourse && selectedSession && selectedTerm && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                  <div className="flex relative">
                    <div
                      onClick={() => setActiveTab("manual")}
                      className={`cursor-pointer flex-1 px-6 py-4 text-sm font-semibold transition-colors duration-200 relative ${
                        activeTab === "manual"
                          ? "text-[#006ef5]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        Manual Entry
                      </div>
                    </div>
                    <div
                      onClick={() => setActiveTab("excel")}
                      className={`cursor-pointer flex-1 px-6 py-4 text-sm font-semibold transition-colors duration-200 relative ${
                        activeTab === "excel"
                          ? "text-[#006ef5]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Excel
                      </div>
                    </div>
                    <div
                      className="absolute bottom-0 h-0.5 bg-[#006ef5] transition-all duration-300 ease-in-out"
                      style={{
                        width: "50%",
                        left: activeTab === "manual" ? "0%" : "50%",
                      }}
                    />
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === "excel" ? (
                    <ExcelUploadTab
                      excelFile={excelFile}
                      setExcelFile={setExcelFile}
                      uploadedResults={uploadedResults}
                      setUploadedResults={setUploadedResults}
                    />
                  ) : (
                    <ManualEntryTab
                      students={students}
                      setStudents={setStudents}
                      allStudents={allStudents}
                      selectedStudents={selectedStudents}
                      setSelectedStudents={setSelectedStudents}
                      userId={user?._id}
                      fetchData={fetchData}
                    />
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <button
                  onClick={handleSubmitResults}
                  disabled={isSubmitting}
                  className="w-full bg-[#006ef5] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0052cc] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <ClipLoader color="#ffffff" size={20} />
                      Uploading Results...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Results
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
