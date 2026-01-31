const courseRouter = require("express").Router();
const {
  getCoursesByAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
  addTeacherAsCourseAdmin,
  getTeachersWithTheirCourses,
  removeTeacherAsCourseAdmin
} = require("../controllers/admins/courses");
const { getCoursesInfinite } = require("../controllers/courseReg");

// Route to create a course
courseRouter.post("/create-course", async (req, res) => {
  try {
    await createCourse(req, res);
  } catch (error) {
    console.error("Error in create-course route:", error);
    res.status(500).send({ success: false, message: error?.message });
  }
});

// Route to fetch courses by admin (with search, size, lastId)
courseRouter.post("/get-courses", async (req, res) => {
  try {
    await getCoursesByAdmin(req, res);
  } catch (error) {
    console.error("Error in get-courses route:", error);
    res.status(500).send({ success: false, message: error?.message });
  }
});

courseRouter.post("/delete-course", async (req, res) => {
  try {
    await deleteCourse(req, res);
  } catch (error) {
    console.error("Error in delete-courses route:", error);
    res.status(500).send({ success: false, message: error?.message });
  }
});

courseRouter.post("/edit-course", async (req, res) => {
  try {
    await updateCourse(req, res);
  } catch (error) {
    console.error("Error in edit-courses route:", error);
    res.status(500).send({ success: false, message: error?.message });
  }
});

courseRouter.post("/set-course-admin", async (req, res) => {
  try {
    await addTeacherAsCourseAdmin(req, res);
  } catch (error) {
    console.error("Error in setting course route", error);
    res.status(500).send({ success: false, message: error?.message });
  }
});

courseRouter.post("/teacher-courses", async (req, res) => {
  try {
    await getTeachersWithTheirCourses(req, res);
  } catch (error) {
    console.error("Error in getting course route:", error);
    res.status(500).send({ success: false, message: error?.message });
  }
});

courseRouter.post("/remove-teacher", async (req, res) => {
  try {
    await removeTeacherAsCourseAdmin(req, res);
  } catch (error) {
    console.error("Error in removing teacher", error);
    res.status(500).send({ success: false, message: error?.message });
  }
});

courseRouter.post("/fetch-course-for-reg", async (req, res) => {
  try {
    await getCoursesInfinite(req, res);
  } catch (error) {
    console.error("Error in course reg", error);
    res.status(500).send({ success: false, message: error?.message });
  }
});

module.exports = { courseRouter };
