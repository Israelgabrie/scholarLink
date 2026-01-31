const Result = require("../schemas/results");
const Course = require("../schemas/course");
const User = require("../schemas/user");
const mongoose = require("mongoose");

async function uploadResults(req, res) {
  try {
    const {
      userId,
      courseId,
      teacherId,
      session,
      term,
      uploadMethod,
      results,
    } = req.body;

    // Convert and validate required fields
    const convertedUserId = String(userId || "").trim();
    const convertedCourseId = String(courseId || "").trim();
    const convertedTeacherId = String(teacherId || "").trim();
    const convertedSession = String(session || "").trim();
    const convertedTerm = String(term || "")
      .trim()
      .toUpperCase();

    // Validation
    if (
      !convertedUserId ||
      !convertedCourseId ||
      !convertedTeacherId ||
      !convertedSession ||
      !convertedTerm ||
      !results ||
      !Array.isArray(results)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: userId, courseId, teacherId, session, term, and results array are required",
      });
    }

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(convertedUserId) ||
      !mongoose.Types.ObjectId.isValid(convertedCourseId) ||
      !mongoose.Types.ObjectId.isValid(convertedTeacherId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // Get uploader (user) and school
    const uploader = await User.findById(convertedUserId);
    if (!uploader) {
      return res.status(404).json({
        success: false,
        message: "Uploader not found",
      });
    }

    const schoolId = uploader.school;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "Uploader has no school assigned",
      });
    }

    // Verify teacher exists and is a teacher
    const teacher = await User.findById(convertedTeacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({
        success: false,
        message: "Teacher not found or invalid teacher role",
      });
    }

    // Verify course exists and belongs to same school
    const course = await Course.findById(convertedCourseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!course.school.equals(schoolId)) {
      return res.status(403).json({
        success: false,
        message: "Course does not belong to your school",
      });
    }

    // Verify teacher is course admin
    if (!course.admins.some((admin) => admin.equals(convertedTeacherId))) {
      return res.status(403).json({
        success: false,
        message: "Teacher is not authorized to upload results for this course",
      });
    }

    // Prepare results for bulk insert
    const resultDocs = [];
    const errors = [];

    for (const resultData of results) {
      // Convert all incoming data to proper types
      const matricNumber = String(resultData.matricNumber || "").trim();
      const testScore = Number(resultData.testScore);
      const examScore = Number(resultData.examScore);

      if (!matricNumber) {
        errors.push(
          `Missing or invalid matric number: ${JSON.stringify(resultData)}`,
        );
        continue;
      }

      // Find student by matric number in the same school
      const student = await User.findOne({
        matricNumber: matricNumber,
        school: schoolId,
        role: "student",
      });

      if (!student) {
        errors.push(
          `Student with matric number "${matricNumber}" not found in your school`,
        );
        continue;
      }

      // Validate scores
      if (isNaN(testScore) || testScore < 0 || testScore > 100) {
        errors.push(
          `Invalid test score for student ${matricNumber}: ${resultData.testScore}. Must be between 0-100`,
        );
        continue;
      }

      if (isNaN(examScore) || examScore < 0 || examScore > 100) {
        errors.push(
          `Invalid exam score for student ${matricNumber}: ${resultData.examScore}. Must be between 0-100`,
        );
        continue;
      }

      resultDocs.push({
        course: convertedCourseId,
        teacher: convertedTeacherId,
        student: student._id,
        school: schoolId,
        session: convertedSession,
        term: convertedTerm,
        testScore: testScore,
        examScore: examScore,
        uploader: convertedUserId,
      });
    }

    if (resultDocs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid results to upload",
        errors,
      });
    }

    // Bulk insert with error handling for duplicates
    const bulkOps = resultDocs.map((doc) => ({
      updateOne: {
        filter: {
          student: doc.student,
          course: doc.course,
          session: doc.session,
          term: doc.term,
        },
        update: { $set: doc },
        upsert: true,
      },
    }));

    const bulkResult = await Result.bulkWrite(bulkOps, { ordered: false });
    const insertedCount = bulkResult.upsertedCount + bulkResult.modifiedCount;

    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${insertedCount} results`,
      uploadedCount: insertedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Upload results error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate result entry detected",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload results",
    });
  }
}

module.exports = { uploadResults };
