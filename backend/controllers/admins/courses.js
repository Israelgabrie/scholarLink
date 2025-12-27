// controllers/courseController.js
const Course = require("../../schemas/course");
const User = require("../../schemas/user");
const School = require("../../schemas/school");

async function createCourse(req, res) {
  try {
    const { userId, courseCode, courseTitle, description } = req.body;

    if (!userId || !courseCode || !courseTitle) {
      return res.status(400).json({
        success: false,
        message: "userId, courseCode, and courseTitle are required",
      });
    }

    // 1️⃣ Find the user
    const user = await User.findById(userId).populate("school");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.school) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a school",
      });
    }

    // 2️⃣ Check if a course with the same code already exists in this school
    const existingCourse = await Course.findOne({
      courseCode: courseCode.toUpperCase(),
      school: user.school._id,
    });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "Course code already exists in this school",
      });
    }

    // 3️⃣ Create the new course
    const newCourse = new Course({
      courseCode: courseCode.toUpperCase(),
      title: courseTitle,
      description: description || "",
      school: user.school._id,
      createdBy: user._id,
      admins: [user._id], // initial admin is the creator
    });

    await newCourse.save();

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function getCoursesByAdmin(req, res) {
  try {
    const { userId, search = "", size = 30, lastId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Verify that user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build query
    const query = { admins: userId };

    if (search && search.trim() !== "") {
      query.courseCode = { $regex: search.trim(), $options: "i" }; // case-insensitive
    }

    if (lastId) {
      // Only get courses created before the last fetched course
      query._id = { $lt: lastId };
    }

    // Fetch courses with optional search, limit, and infinite scroll
    const courses = await Course.find(query)
      .sort({ _id: -1 }) // _id can be used for pagination
      .limit(parseInt(size))
      .populate("school", "name schoolId")
      .populate("createdBy", "fullName email");

    return res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function updateCourse(req, res) {
  try {
    
    const { userId, courseId, courseCode, courseTitle, description } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "userId and courseId are required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Only admins of this course can edit
    if (!course.admins.includes(userId)) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to edit this course",
      });
    }

    // Update fields if provided
    if (courseCode) course.courseCode = courseCode.toUpperCase();
    if (courseTitle) course.title = courseTitle;
    if (description !== undefined) course.description = description;

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function deleteCourse(req, res) {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "userId and courseId are required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Only admins can delete
    if (!course.admins.includes(userId)) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this course",
      });
    }

    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  createCourse,
  getCoursesByAdmin,
  deleteCourse,
  updateCourse,
};
