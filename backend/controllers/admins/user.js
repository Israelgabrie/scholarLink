const User = require("../../schemas/user");

const Course = require("../../schemas/course");

/* ---------------- CONTROLLER ---------------- */
async function getUsersByAdmin(req, res) {
  try {
    const {
      userId,
      fullName,
      role,
      email,
      matricNumber,
      size = 30,
      lastId,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Verify admin user
    const adminUser = await User.findById(userId);
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    if (!adminUser.school) {
      return res.status(400).json({
        success: false,
        message: "Admin user does not belong to a school",
      });
    }

    /* ---------------- BASE QUERY ---------------- */
    const query = {
      school: adminUser.school, // same school ONLY
      _id: { $ne: userId }, // exclude requester
    };

    /* ---------------- FILTERS ---------------- */
    if (fullName && fullName.trim()) {
      query.fullName = { $regex: fullName.trim(), $options: "i" };
    }

    if (role) {
      query.role = role;
    }

    if (email && email.trim()) {
      query.email = { $regex: email.trim(), $options: "i" };
    }

    if (matricNumber && matricNumber.trim()) {
      query.matricNumber = {
        $regex: matricNumber.trim(),
        $options: "i",
      };
    }

    /* ---------------- PAGINATION ---------------- */
    if (lastId) {
      query._id = { ...query._id, $lt: lastId };
    }

    /* ---------------- FETCH ---------------- */
    const users = await User.find(query)
      .sort({ _id: -1 })
      .limit(parseInt(size))
      .select("-password")
      .populate("school", "name schoolId");

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

/* ---------------- CONTROLLER ---------------- */
async function getSchoolTeachersAndCourses(req, res) {
  try {
    const {
      userId,
      courseSize = 30,
      lastCourseId,
      courseSearch = "",
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Verify requesting user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.school) {
      return res.status(400).json({
        success: false,
        message: "User does not belong to a school",
      });
    }

    /* ---------------- TEACHERS ---------------- */
    const teachers = await User.find({
      school: user.school,
      role: "teacher",
    })
      .select("-password")
      .sort({ fullName: 1 }); // optional alphabetical order

    /* ---------------- COURSES ---------------- */
    const courseQuery = {
      school: user.school,
    };

    // Search courses
    if (courseSearch && courseSearch.trim()) {
      courseQuery.$or = [
        { courseCode: { $regex: courseSearch.trim(), $options: "i" } },
        { title: { $regex: courseSearch.trim(), $options: "i" } },
      ];
    }

    // Pagination
    if (lastCourseId) {
      courseQuery._id = { $lt: lastCourseId };
    }

    const courses = await Course.find(courseQuery)
      .sort({ _id: -1 })
      .limit(parseInt(courseSize))
      .populate("createdBy", "fullName email")
      .populate("school", "name schoolId");

    /* ---------------- RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      data: {
        teachers,
        courses,
      },
    });
  } catch (error) {
    console.error("Error fetching teachers and courses:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

module.exports = { getUsersByAdmin, getSchoolTeachersAndCourses };
