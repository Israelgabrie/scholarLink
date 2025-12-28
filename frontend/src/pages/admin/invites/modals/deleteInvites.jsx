import React, { useState } from "react";
import Modal from "react-modal";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import { deleteInvite } from "../../../../services/invite";
import { useUser } from "../../../../contexts/userContext";

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
    borderRadius: "16px",
    maxWidth: "440px",
    width: "90%",
  },
};

export default function DeleteInviteModal({ isOpen, setIsOpen, data, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useUser();

  const handleDelete = async () => {
    if (!data?._id) {
      toast.error("Invite ID is missing");
      return;
    }

    setIsDeleting(true);

    try {
      console.log("Deleting invite:", data);

      const response = await deleteInvite({
        inviteId: data?._id,
        userId:user?._id
      });

      console.log("Delete Response:", response);

      if (response?.success) {
        toast.success(response?.message || "Invite deleted successfully!");
        setIsOpen(false);

        if (onSuccess) {
          onSuccess(data?._id);
        }
      } else {
        toast.error(response?.message || "Failed to delete invite");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error?.message || "Failed to delete invite");
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
      contentLabel="Delete Invite Modal"
    >
      <div className="bg-white rounded-2xl overflow-hidden">
        <button
          onClick={handleClose}
          disabled={isDeleting}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all disabled:opacity-50 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Delete Invite?
          </h2>

          <p className="text-sm text-gray-600 mb-5">
            This will permanently delete this invite and it cannot be undone.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-200">
            <div className="space-y-2.5 text-left">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">
                  Email
                </p>
                <p className="text-base font-bold text-[#006ef5]">
                  {data?.email || "N/A"}
                </p>
              </div>
              <div className="border-t border-gray-200 pt-2.5">
                <p className="text-xs font-medium text-gray-500 mb-0.5">
                  Matric Number
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {data?.matricNumber || "N/A"}
                </p>
              </div>
              <div className="border-t border-gray-200 pt-2.5">
                <p className="text-xs font-medium text-gray-500 mb-0.5">
                  Department
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {data?.department || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: window.innerWidth < 640 ? 'column' : 'row', gap: '12px' }}>
            <button
              onClick={handleClose}
              disabled={isDeleting}
              style={{ flex: 1 }}
              className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              style={{ flex: 1 }}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <ClipLoader color="#ffffff" size={16} />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Invite
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}