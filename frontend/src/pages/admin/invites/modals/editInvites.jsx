import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Edit2, X } from "lucide-react";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import { useUser } from "../../../../contexts/userContext";
import { editInvite } from "../../../../services/invite";

if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

const getModalStyles = () => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  return {
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
      maxWidth: isMobile ? "95%" : "600px",
      width: isMobile ? "95%" : "90%",
      maxHeight: "90vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
  };
};

export default function EditInviteModal({
  isOpen,
  setIsOpen,
  data,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [program, setProgram] = useState("");
  const [session, setSession] = useState("");
  const [className, setClassName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (data) {
      setName(data?.name || "");
      setMatricNumber(data?.matricNumber || "");
      setDepartment(data?.department || "");
      setProgram(data?.program || "");
      setSession(data?.session || "");
      setClassName(data?.className || "");
    }
  }, [data]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!data?._id) {
      toast.error("Invite ID is missing");
      return;
    }

    setIsUpdating(true);
    try {
      const updatedData = {
        inviteId: data?._id,
        name,
        matricNumber,
        department,
        program,
        session,
        className,
        userId: user?._id,
      };

      const response = await editInvite(updatedData);
      console.log("Update response:", response);

      if (response?.success) {
        toast.success(response?.message || "Invite updated successfully!");
        if (onSuccess) {
          onSuccess({
            ...data,
            name,
            matricNumber,
            department,
            program,
            session,
            className,
          });
        }
        setIsOpen(false);
      } else {
        toast.error(response?.message || "Failed to update invite");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.message || "Failed to update invite");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={getModalStyles()}
      contentLabel="Edit Invite Modal"
    >
      <div className="bg-white rounded-2xl flex flex-col max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-[#006ef5] to-[#0052cc] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
              <Edit2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Edit Invite
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isUpdating}
            className="text-white/90 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John Doe"
              required
              disabled={isUpdating}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006ef5]/20 focus:border-[#006ef5] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Matric Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
              placeholder="e.g., CS2025001"
              required
              disabled={isUpdating}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006ef5]/20 focus:border-[#006ef5] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., Computer Science"
              required
              disabled={isUpdating}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006ef5]/20 focus:border-[#006ef5] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Program <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="e.g., B.Sc"
              required
              disabled={isUpdating}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006ef5]/20 focus:border-[#006ef5] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Session <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              placeholder="e.g., 2024/2025"
              required
              disabled={isUpdating}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006ef5]/20 focus:border-[#006ef5] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Class Name
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g., Year 1A, 100 Level"
              disabled={isUpdating}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006ef5]/20 focus:border-[#006ef5] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-200 rounded-b-2xl">
          <div
            style={{
              display: "flex",
              flexDirection: window.innerWidth < 640 ? "column" : "row",
              gap: "12px",
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={isUpdating}
              style={{ flex: 1 }}
              className="px-5 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-white hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              style={{ flex: 1 }}
              className="px-5 py-3 bg-gradient-to-r from-[#006ef5] to-[#0052cc] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <ClipLoader color="#ffffff" size={16} />
                  Updating...
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Update Invite
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}