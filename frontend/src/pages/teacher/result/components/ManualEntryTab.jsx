import React, { useState } from "react";
import { Filter, X, Users } from "lucide-react";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

export default function ManualEntryTab({
  students,
  setStudents,
  allStudents,
  selectedStudents,
  setSelectedStudents,
  userId,
  fetchData,
}) {
  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    className: "",
    matricNumber: "",
    session: "",
    department: "",
    program: "",
  });

  // Loading state
  const [filterLoading, setFilterLoading] = useState(false);

  // Handle Filter Change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  // Apply Filters - calls parent's fetchData
  const applyFilters = async () => {
    try {
      setFilterLoading(true);
      await fetchData({
        search: filters.matricNumber,
        className: filters.className,
        session: filters.session,
        department: filters.department,
        program: filters.program,
      });
      toast.success("Filters applied");
    } catch (error) {
      console.error("Error applying filters:", error);
      toast.error("Failed to apply filters");
    } finally {
      setFilterLoading(false);
    }
  };

  // Reset Filters
  const resetFilters = async () => {
    setFilters({
      className: "",
      matricNumber: "",
      session: "",
      department: "",
      program: "",
    });
    try {
      setFilterLoading(true);
      await fetchData({});
      toast.success("Filters reset");
    } catch (error) {
      console.error("Error resetting filters:", error);
      toast.error("Failed to reset filters");
    } finally {
      setFilterLoading(false);
    }
  };

  // Toggle Student Selection
  const toggleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  // Select All Students
  const selectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s._id));
    }
  };

  // Handle Score Change
  const handleScoreChange = (studentId, field, value) => {
    setStudents(
      students.map((student) =>
        student._id === studentId ? { ...student, [field]: value } : student,
      ),
    );
  };

  return (
    <>
      {/* Filters Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#006ef5]" />
            Filters
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-[#006ef5] hover:text-[#0052cc] font-medium text-sm flex items-center gap-1"
          >
            {showFilters ? (
              <>
                <X className="w-4 h-4" /> Hide Filters
              </>
            ) : (
              <>
                <Filter className="w-4 h-4" /> Show Filters
              </>
            )}
          </button>
        </div>

        {showFilters && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name
                </label>
                <input
                  type="text"
                  value={filters.className}
                  onChange={(e) =>
                    handleFilterChange("className", e.target.value)
                  }
                  placeholder="e.g., 100 Level"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matric Number
                </label>
                <input
                  type="text"
                  value={filters.matricNumber}
                  onChange={(e) =>
                    handleFilterChange("matricNumber", e.target.value)
                  }
                  placeholder="Search by matric number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session
                </label>
                <input
                  type="text"
                  value={filters.session}
                  onChange={(e) => handleFilterChange("session", e.target.value)}
                  placeholder="e.g., 2024/2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={filters.department}
                  onChange={(e) =>
                    handleFilterChange("department", e.target.value)
                  }
                  placeholder="e.g., Computer Science"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program
                </label>
                <input
                  type="text"
                  value={filters.program}
                  onChange={(e) =>
                    handleFilterChange("program", e.target.value)
                  }
                  placeholder="e.g., Software Engineering"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={applyFilters}
                disabled={filterLoading}
                className="bg-[#006ef5] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0052cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {filterLoading && <ClipLoader color="#ffffff" size={16} />}
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                disabled={filterLoading}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          </>
        )}
      </div>

      {/* Students Table Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#006ef5]" />
            Students ({students.length})
          </h2>
          {students.length > 0 && (
            <button
              onClick={selectAllStudents}
              className="text-sm text-[#006ef5] hover:text-[#0052cc] font-medium"
            >
              {selectedStudents.length === students.length
                ? "Deselect All"
                : "Select All"}
            </button>
          )}
        </div>

        {filterLoading ? (
          <div className="flex items-center justify-center py-12">
            <ClipLoader color="#006ef5" size={40} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      <input
                        type="checkbox"
                        checked={
                          selectedStudents.length === students.length &&
                          students.length > 0
                        }
                        onChange={selectAllStudents}
                        className="w-4 h-4 text-[#006ef5] rounded focus:ring-[#006ef5]"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      MATRIC NUMBER
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      NAME
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      CLASS
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      DEPARTMENT
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      TEST SCORE (30)
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      EXAM SCORE (70)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => toggleStudentSelection(student._id)}
                          className="w-4 h-4 text-[#006ef5] rounded focus:ring-[#006ef5]"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                        {student.matricNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {student.fullName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {student.className}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {student.department}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={student.testScore || ""}
                          onChange={(e) =>
                            handleScoreChange(
                              student._id,
                              "testScore",
                              e.target.value,
                            )
                          }
                          disabled={!selectedStudents.includes(student._id)}
                          placeholder="0"
                          className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max="70"
                          value={student.examScore || ""}
                          onChange={(e) =>
                            handleScoreChange(
                              student._id,
                              "examScore",
                              e.target.value,
                            )
                          }
                          disabled={!selectedStudents.includes(student._id)}
                          placeholder="0"
                          className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {students.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No students found. Try adjusting your filters.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}