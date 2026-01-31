const mongoose = require("mongoose");
const Course = require("../schemas/course");

async function getCoursesInfinite(req, res) {
  try {
    const {
      userId,
      search = "",
      size = 30,
      lastId,
    } = req.body || {};

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const limit = Math.min(Number(size) || 30, 50);

    // ---------------------------
    // Build query
    // ---------------------------
    const query = {};

    // Search by title or courseCode
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { courseCode: { $regex: search, $options: "i" } },
      ];
    }

    // Infinite scrolling (cursor-based)
    if (lastId && mongoose.Types.ObjectId.isValid(lastId)) {
      query._id = { $lt: lastId };
    }

    // ---------------------------
    // Fetch courses
    // ---------------------------
    const courses = await Course.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .select("_id title courseCode admins")
      .populate({
        path: "admins",
        select: "name fullName username",
      });

    // ---------------------------
    // Format response
    // ---------------------------
    const formattedCourses = courses.map(course => ({
      id: course._id,
      courseTitle: course.title,
      courseCode: course.courseCode, // ✅ FIXED
      admins: course.admins
        .map(admin => admin?.name || admin?.fullName || admin?.username)
        .filter(Boolean),
    }));

    return res.status(200).json({
      success: true,
      courses: formattedCourses,
      nextLastId:
        courses.length > 0 ? courses[courses.length - 1]._id : null,
      hasMore: courses.length === limit,
    });
  } catch (error) {
    console.error("getCoursesInfinite error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
}

module.exports = { getCoursesInfinite };
