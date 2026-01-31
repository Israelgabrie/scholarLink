const AWS = require("aws-sdk");
const User = require("../../schemas/user");
const mongoose = require("mongoose");
const { createLog } = require("../../schemas/logSchema");

/* ---------------- CLOUDFARE R2 ---------------- */
const s3 = new AWS.S3({
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  region: "auto",
});

/* ---------------- HELPERS ---------------- */
async function uploadFileToR2(buffer, fileName, mimeType) {
  const params = {
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: mimeType,
  };

  await s3.upload(params).promise();

  return `${process.env.CLOUDFLARE_PUBLIC_URL}/${fileName}`;
}

async function deleteFileFromR2(fileUrl) {
  if (!fileUrl) return;

  const key = fileUrl.replace(`${process.env.CLOUDFLARE_PUBLIC_URL}/`, "");

  await s3
    .deleteObject({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: key,
    })
    .promise();
}

/* ---------------- CONTROLLER ---------------- */
async function updateTeacherProfile(req, res) {
  try {
    const { userId, fullName, phoneNumber } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    /* ---------------- VERIFY TEACHER ---------------- */
    const teacher = await User.findById(userId).select("-password");
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Ensure user is a teacher
    if (teacher.role !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only teachers can update teacher profiles.",
      });
    }

    const oldProfileImage = teacher.profileImage;

    /* ---------------- UPDATE FIELDS ---------------- */
    // Update full name if provided and not empty
    if (fullName?.trim()) {
      teacher.fullName = fullName.trim();
    }

    // Update phone number if provided and not empty
    if (phoneNumber?.trim()) {
      teacher.phoneNumber = phoneNumber.trim();
    }

    /* ---------------- HANDLE PROFILE IMAGE ---------------- */
    // Upload new profile image if provided
    if (req.files?.profileImage?.[0]) {
      const file = req.files.profileImage[0];
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000000000);
      const extension = file.originalname.split(".").pop();
      const fileName = `${timestamp}_${randomNum}.${extension}`;

      const newImageUrl = await uploadFileToR2(
        file.buffer,
        fileName,
        file.mimetype
      );

      teacher.profileImage = newImageUrl;
    }

    /* ---------------- SAVE CHANGES ---------------- */
    await teacher.save();

    // Delete old profile image AFTER successful save
    if (req.files?.profileImage?.[0] && oldProfileImage) {
      await deleteFileFromR2(oldProfileImage).catch(error => {
        // Log but don't fail the request if deletion fails
        console.error("Failed to delete old profile image:", error);
      });
    }

    /* ---------------- LOGGING ---------------- */
    // Fire-and-forget logging
    createLog({
      title: "Teacher profile updated",
      content: `${teacher.fullName} updated their teacher profile`,
      action: "UPDATE",
      actor: teacher._id,
      level: "INFO",
    });

    /* ---------------- RETURN UPDATED TEACHER ---------------- */
    // Get fresh data with populated school info
    const updatedTeacher = await User.findById(teacher._id)
      .select("-password")
      .populate("school", "name address currentSession profileImage");

    return res.status(200).json({
      success: true,
      message: "Teacher profile updated successfully",
      user: updatedTeacher,
    });
  } catch (err) {
    console.error("❌ Teacher update error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update teacher profile",
    });
  }
}

/* ---------------- GET TEACHER PROFILE ---------------- */
async function getTeacherProfile(req, res) {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const teacher = await User.findById(userId)
      .select("-password")
      .populate("school", "name address currentSession profileImage");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Optional: Verify the user is a teacher
    if (teacher.role !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Access denied. User is not a teacher.",
      });
    }

    return res.status(200).json({
      success: true,
      teacher,
    });
  } catch (err) {
    console.error("❌ Get teacher profile error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch teacher profile",
    });
  }
}

module.exports = { updateTeacherProfile, getTeacherProfile };