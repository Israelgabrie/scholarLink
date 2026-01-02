const userRouter = require("express").Router();
const { getUsersByAdmin,getSchoolTeachersAndCourses } = require("../controllers/admins/user");

userRouter.post("/users", (req, res) => {
  try {
    getUsersByAdmin(req, res);
  } catch (error) {
    res.send({ success: false, message: error?.message });
  }
});

userRouter.post("/teacher-courses", (req, res) => {
  try {
    getSchoolTeachersAndCourses(req, res);
  } catch (error) {
    res.send({ success: false, message: error?.message });
  }
});



module.exports = { userRouter };
