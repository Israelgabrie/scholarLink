// EditCourseModal.jsx
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Edit2, X } from "lucide-react";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import { useUser } from "../../../../contexts/userContext";
import { editCourse } from "../../../../services/course";

// Set app element for accessibility
if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    padding: "0",
    border: "none",
    borderRadius: "12px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
  },
};

export default function EditCourseModal({ isOpen, setIsOpen, data, onSuccess }) {
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (data) {
      setCourseCode(data?.courseCode || "");
      setCourseTitle(data?.title || "");
      setDescription(data?.description || "");
    }
  }, [data]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!data?._id) {
      toast.error("Course ID is missing");
      return;
    }

    setIsUpdating(true);

    try {
      const updatedData = {
        courseId: data?._id,
        courseCode,
        courseTitle,
        description,
        userId: user?._id,
      };

      const response = await editCourse(updatedData);
      console.log("Update response:", response);

      if (response?.success) {
        toast.success(response?.message || "Course updated successfully!");
        
        // Call onSuccess callback to update parent state
        if (onSuccess) {
          onSuccess({
            ...data,
            courseCode,
            title: courseTitle,
            description,
          });
        }
        
        setIsOpen(false);
      } else {
        toast.error(response?.message || "Failed to update course");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.message || "Failed to update course");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      setIsOpen(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={customStyles}
      contentLabel="Edit Course Modal"
    >
      <div className="bg-white rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Edit2 className="w-5 h-5 text-[#006ef5]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Edit Course</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isUpdating}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleUpdate}>
          <div className="p-6 space-y-4">
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
                disabled={isUpdating}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={isUpdating}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter course description..."
                required
                rows="5"
                disabled={isUpdating}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUpdating}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 px-4 py-2.5 bg-[#006ef5] text-white rounded-lg font-medium hover:bg-[#0052cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <ClipLoader color="#ffffff" size={16} />
                  Updating...
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Update Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}