const resultRouter = require("express").Router();
const {
  getSchoolCoursesAndStudents,
} = require("../controllers/teacher/getCourseAndStudent");

const {uploadResults} = require("../controllers/results")



resultRouter.post("/fetch-course-and-student", (req, res) => {
  try {
    getSchoolCoursesAndStudents(req, res);
  } catch (error) {
    res.send({ success: true, message: error?.message });
  }
});

resultRouter.post("/upload-result", (req, res) => {
  try {
    uploadResults(req, res);
  } catch (error) {
    res.send({ success: true, message: error?.message });
  }
});



module.exports = { resultRouter };
