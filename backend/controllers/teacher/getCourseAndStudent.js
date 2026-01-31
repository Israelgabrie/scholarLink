const User = require("../../schemas/user");
const Course = require("../../schemas/course");

async function getSchoolCoursesAndStudents(req, res) {
  try {
    const { 
      userId, 
      search, 
      size = 30, 
      lastId,
      className,
      session,
      department,
      program,
      courseSearch
    } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "userId is required" 
      });
    }

    // Get user and their school
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const schoolId = user.school;
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "User has no school assigned" 
      });
    }

    /* ---------------- FETCH COURSES WITH SEARCH ---------------- */
    const courseQuery = { school: schoolId };

    if (courseSearch) {
      const caseInsensitiveSearch = new RegExp(courseSearch, 'i');
      courseQuery.$or = [
        { courseCode: caseInsensitiveSearch },
        { title: caseInsensitiveSearch },
        { description: caseInsensitiveSearch }
      ];
    }

    const courses = await Course.find(courseQuery)
      .populate("createdBy", "fullName email")
      .populate("admins", "fullName email")
      .sort({ createdAt: -1 });

    /* ---------------- FETCH STUDENTS WITH PAGINATION ---------------- */
    const studentQuery = { 
      school: schoolId, 
      role: "student" 
    };

    // Search filter for students
    if (search) {
      const caseInsensitiveSearch = new RegExp(search, 'i');
      studentQuery.$or = [
        { fullName: caseInsensitiveSearch },
        { matricNumber: caseInsensitiveSearch },
        { email: caseInsensitiveSearch }
      ];
    }

    // Additional filters - all case insensitive
    if (className) {
      studentQuery.className = new RegExp(className, 'i');
    }

    if (session) {
      studentQuery.session = new RegExp(session, 'i');
    }

    if (department) {
      studentQuery.department = new RegExp(department, 'i');
    }

    if (program) {
      studentQuery.program = new RegExp(program, 'i');
    }

    // Infinite scroll: get students after lastId
    if (lastId) {
      const lastStudent = await User.findById(lastId);
      if (lastStudent) {
        studentQuery._id = { $gt: lastStudent._id };
      }
    }

    const students = await User.find(studentQuery)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(Number(size));

    /* ---------------- RETURN RESULTS ---------------- */
    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      courses,
      students,
      hasMore: students.length === Number(size)
    });

  } catch (error) {
    console.error("Get school courses and students error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
module.exports = { getSchoolCoursesAndStudents };