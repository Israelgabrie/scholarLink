const AWS = require("aws-sdk");
const User = require("../../schemas/user");
const School = require("../../schemas/school");
const mongoose = require("mongoose");
const {createLog} = require("../../schemas/logSchema")

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

  const key = fileUrl.replace(
    `${process.env.CLOUDFLARE_PUBLIC_URL}/`,
    ""
  );

  await s3
    .deleteObject({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: key,
    })
    .promise();
}



/* ---------------- CONTROLLER ---------------- */
async function updateAdminUser(req, res) {
  try {
    const {
      userId,
      fullName,
      phoneNumber,
      schoolName,
      schoolAddress,
      currentSession,
      allowCourseRegistration,
    } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    /* ---------------- USER ---------------- */
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldUserImage = user.profileImage;

    if (fullName?.trim()) user.fullName = fullName.trim();
    if (phoneNumber?.trim()) user.phoneNumber = phoneNumber.trim();

    // Upload NEW user image first
    if (req.files?.userImage?.[0]) {
      const file = req.files.userImage[0];
      const fileName = `users/${user._id}_${Date.now()}_${file.originalname}`;

      const newImageUrl = await uploadFileToR2(
        file.buffer,
        fileName,
        file.mimetype
      );

      user.profileImage = newImageUrl;
    }

    await user.save();

    // Delete OLD user image AFTER save
    if (req.files?.userImage?.[0] && oldUserImage) {
      await deleteFileFromR2(oldUserImage);
    }

    /* ---------------- SCHOOL ---------------- */
    if (user.school) {
      const school = await School.findById(user.school);
      if (!school) {
        return res.status(404).json({
          success: false,
          message: "School not found",
        });
      }

      const oldSchoolImage = school.profileImage;

      if (schoolName?.trim()) school.name = schoolName.trim();
      if (schoolAddress?.trim()) school.address = schoolAddress.trim();
      if (currentSession?.trim()) school.currentSession = currentSession.trim();

      if (allowCourseRegistration !== undefined) {
        school.allowCourseRegistration =
          allowCourseRegistration === true ||
          allowCourseRegistration === "true";
      }

      // Upload NEW school image first
      if (req.files?.schoolImage?.[0]) {
        const file = req.files.schoolImage[0];
        const fileName = `schools/${school._id}_${Date.now()}_${file.originalname}`;

        const newSchoolImage = await uploadFileToR2(
          file.buffer,
          fileName,
          file.mimetype
        );

        school.profileImage = newSchoolImage;
      }

      await school.save();

      // Delete OLD school image AFTER save
      if (req.files?.schoolImage?.[0] && oldSchoolImage) {
        await deleteFileFromR2(oldSchoolImage);
      }
    }

    /* ---------------- RETURN ---------------- */
    const updatedUser = await User.findById(user._id)
      .select("-password")
      .populate("school");

    // Fire-and-forget logging, won't block the operation
    createLog({
      title: "Admin settings updated",
      content: `${updatedUser.fullName} updated their profile and school settings`,
      action: "UPDATE",
      actor: updatedUser._id,
      level: "INFO",
    });

    return res.status(200).json({
      success: true,
      message: "Admin update successful",
      user: updatedUser,
    });
  } catch (err) {
    console.error("❌ Admin update error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update admin",
    });
  }
}


module.exports = { updateAdminUser };
