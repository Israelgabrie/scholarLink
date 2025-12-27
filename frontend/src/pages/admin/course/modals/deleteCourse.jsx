// DeleteCourseModal.jsx
import React, { useState } from "react";
import Modal from "react-modal";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import { deleteCourse } from "../../../../services/course";
import { useUser } from "../../../../contexts/userContext";

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
    maxWidth: "500px",
    width: "90%",
  },
};

export default function DeleteCourseModal({ isOpen, setIsOpen, data, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useUser();

  const handleDelete = async () => {
    if (!data?._id) {
      toast.error("Course ID is missing");
      return;
    }

    setIsDeleting(true);

    try {
      console.log("Deleting course:", data);

      const response = await deleteCourse({
        courseId: data?._id,
        userId: user?._id,
      });

      console.log("Delete Response:", response);

      if (response?.success) {
        toast.success(response?.message || "Course deleted successfully!");
        setIsOpen(false);

        // Call onSuccess callback to update parent component
        if (onSuccess) {
          onSuccess(data?._id);
        }
      } else {
        toast.error(response?.message || "Failed to delete course");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error?.message || "Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setIsOpen(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={customStyles}
      contentLabel="Delete Course Modal"
    >
      <div className="bg-white rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Delete Course
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-yellow-100 p-3 rounded-full flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Are you sure?
              </h3>
              <p className="text-gray-600 mb-4">
                This action cannot be undone. This will permanently delete the
                course:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Course Code:
                    </span>
                    <p className="text-base font-semibold text-[#006ef5]">
                      {data?.courseCode || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Course Title:
                    </span>
                    <p className="text-base font-semibold text-gray-800">
                      {data?.title || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <ClipLoader color="#ffffff" size={16} />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Course
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}