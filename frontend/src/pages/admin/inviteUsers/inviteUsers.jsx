import React, { useState } from "react";
import {
  UserPlus,
  Upload,
  Plus,
  Send,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { useUser } from "../../../contexts/userContext";
import { createInvite } from "../../../services/invite";

export default function InviteUsersPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("manual");
  const [defaultSession, setDefaultSession] = useState("");
  const [defaultDepartment, setDefaultDepartment] = useState("");
  const [defaultProgram, setDefaultProgram] = useState("");
  const [users, setUsers] = useState([
    {
      name: "",
      email: "",
      department: "",
      role: "student",
      matricNumber: "",
      program: "",
      session: "",
      className: "",
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  const addUser = () => {
    setUsers([
      ...users,
      {
        name: "",
        email: "",
        department: "",
        role: "student",
        matricNumber: "",
        program: "",
        session: "",
        className: "",
      },
    ]);
  };

  const removeUser = (index) => {
    if (users.length > 1) {
      setUsers(users.filter((_, i) => i !== index));
    }
  };

  const updateUser = (index, field, value) => {
    const newUsers = [...users];
    newUsers[index][field] = value;
    setUsers(newUsers);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const parsedUsers = data.map((row) => ({
          name: row.name || row.Name || "",
          email: row.email || row.Email || "",
          department: row.department || row.Department || "",
          role: (row.role || row.Role || "student").toLowerCase(),
          matricNumber:
            row.matricNumber || row.MatricNumber || row.matric_number || "",
          program: row.program || row.Program || "",
          session: row.session || row.Session || "",
          className: row.className || row.ClassName || row.class_name || "",
        }));

        if (parsedUsers.length > 0) {
          setUsers(parsedUsers);
          toast.success(`${parsedUsers.length} users loaded from file`);
        } else {
          toast.error("No valid user data found in file");
        }
      } catch (error) {
        toast.error("Error reading file. Please check the format.");
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSendInvites = async () => {
    const validUsers = users.filter((u) => u.name && u.email && u.role);

    if (validUsers.length === 0) {
      toast.error(
        "Please add at least one valid user with name, email, and role"
      );
      return;
    }

    // Apply global defaults to users who don't have their own values
    const usersWithDefaults = validUsers.map((u) => ({
      ...u,
      session: u.session || defaultSession || "",
      department: u.department || defaultDepartment || "",
      program: u.program || defaultProgram || "",
    }));

    setIsSending(true);
    try {
      const payload = {
        userId: user?._id,
        schoolId: user?.school?._id,
        users: usersWithDefaults,
      };

      const response = await createInvite(payload);

      if (response?.success) {
        toast.success(
          response?.message || "Invites created and sent successfully"
        );

        // Reset form
        setUsers([
          {
            name: "",
            email: "",
            department: "",
            role: "student",
            matricNumber: "",
            program: "",
            session: "",
            className: "",
          },
        ]);
        setDefaultSession("");
        setDefaultDepartment("");
        setDefaultProgram("");
      } else {
        toast.error(response?.message || "Failed to send invites");
      }
    } catch (error) {
      console.error("Error sending invites:", error);
      toast.error(error?.message || "Failed to send invites");
    } finally {
      setIsSending(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: "John Doe",
        email: "john@example.com",
        department: "Computer Science",
        role: "student",
        matricNumber: "CS2025001",
        program: "BSc Computer Science",
        session: "2025/2026",
        className: "Year 1A",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        department: "Mathematics",
        role: "teacher",
        matricNumber: "",
        program: "MSc Mathematics",
        session: "2025/2026",
        className: "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "invite_users_template.xlsx");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 flex items-center gap-2 text-[#006ef5]">
          <UserPlus color="#006ef5" className="mt-1" />
          Invite Users
        </h1>
        <p className="text-gray-600">
          Send invitation links to students and teachers
        </p>
      </div>

      {/* Tabs Card */}
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
                <Plus className="w-4 h-4" />
                Manual Entry
              </div>
            </div>
            <div
              onClick={() => setActiveTab("upload")}
              className={`cursor-pointer flex-1 px-6 py-4 text-sm font-semibold transition-colors duration-200 relative ${
                activeTab === "upload"
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
          {activeTab === "upload" ? (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-200">
                  <FileSpreadsheet className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Excel File
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Upload an Excel file with user information
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <label className="inline-block cursor-pointer">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="px-6 py-2 bg-[#006ef5] text-white rounded-lg font-semibold hover:bg-[#0052cc] transition-colors inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Choose File
                    </div>
                  </label>

                  <button
                    onClick={downloadTemplate}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Download Template
                  </button>
                </div>
              </div>

              {users.length > 0 && users[0].name && (
                <div className="border-t border-gray-200 pt-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Loaded Users: {users.length}
                  </p>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {users.map((currentUser, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-3 text-sm"
                      >
                        <span className="font-medium text-gray-900">
                          {currentUser.name}
                        </span>
                        <span className="text-gray-400 mx-2">•</span>
                        <span className="text-gray-600">
                          {currentUser.email}
                        </span>
                        <span className="text-gray-400 mx-2">•</span>
                        <span className="text-[#006ef5] capitalize">
                          {currentUser.role}
                        </span>
                        {currentUser.className && (
                          <>
                            <span className="text-gray-400 mx-2">•</span>
                            <span className="text-gray-600">
                              {currentUser.className}
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Global Default Settings */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Default Values (Optional)
                </h3>
                <p className="text-xs text-gray-600 mb-4">
                  These will be used for users without specific values
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Default Session
                    </label>
                    <input
                      type="text"
                      value={defaultSession}
                      onChange={(e) => setDefaultSession(e.target.value)}
                      placeholder="e.g., 2025/2026"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Default Department
                    </label>
                    <input
                      type="text"
                      value={defaultDepartment}
                      onChange={(e) => setDefaultDepartment(e.target.value)}
                      placeholder="e.g., Computer Science"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Default Program
                    </label>
                    <input
                      type="text"
                      value={defaultProgram}
                      onChange={(e) => setDefaultProgram(e.target.value)}
                      placeholder="e.g., BSc Computer Science"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Users</h3>
                  <button
                    onClick={addUser}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add User
                  </button>
                </div>

                {users.map((currentUser, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 space-y-3 relative border border-gray-200"
                  >
                    {users.length > 1 && (
                      <button
                        onClick={() => removeUser(index)}
                        className="absolute top-3 right-3 text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                      <input
                        type="text"
                        value={currentUser.name}
                        onChange={(e) =>
                          updateUser(index, "name", e.target.value)
                        }
                        placeholder="Full Name *"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none"
                      />
                      <input
                        type="email"
                        value={currentUser.email}
                        onChange={(e) =>
                          updateUser(index, "email", e.target.value)
                        }
                        placeholder="Email *"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none"
                      />
                      <input
                        type="text"
                        value={currentUser.department}
                        onChange={(e) =>
                          updateUser(index, "department", e.target.value)
                        }
                        placeholder="Department"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none"
                      />
                      <select
                        value={currentUser.role}
                        onChange={(e) =>
                          updateUser(index, "role", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                      </select>
                      <input
                        type="text"
                        value={currentUser.program}
                        onChange={(e) =>
                          updateUser(index, "program", e.target.value)
                        }
                        placeholder="Program"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none"
                      />
                      <input
                        type="text"
                        value={currentUser.session}
                        onChange={(e) =>
                          updateUser(index, "session", e.target.value)
                        }
                        placeholder="Session (e.g., 2025/2026)"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none"
                      />
                      {currentUser.role === "student" && (
                        <>
                          <input
                            type="text"
                            value={currentUser.matricNumber}
                            onChange={(e) =>
                              updateUser(index, "matricNumber", e.target.value)
                            }
                            placeholder="Matric Number"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none"
                          />
                          <input
                            type="text"
                            value={currentUser.className}
                            onChange={(e) =>
                              updateUser(index, "className", e.target.value)
                            }
                            placeholder="Class Name (e.g., Year 1A)"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none"
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div
          onClick={handleSendInvites}
          disabled={isSending}
          className="cursor-pointer w-full bg-[#006ef5] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0052cc] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <ClipLoader color="#ffffff" size={20} />
              Sending Invites...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Invites
            </>
          )}
        </div>
      </div>
    </div>
  );
}
