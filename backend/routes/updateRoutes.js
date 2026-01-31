const updateRouter = require("express").Router();
const { updateAdminUser } = require("../controllers/admins/adminUpdateUser");
const { updateTeacherProfile } = require("../controllers/teacher/updateTeacher");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

updateRouter.post(
  "/admin",
  upload.fields([
    { name: "userImage", maxCount: 1 },
    { name: "schoolImage", maxCount: 1 },
  ]),
  updateAdminUser
);

updateRouter.post(
  "/teacher",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
  ]),
  updateTeacherProfile
);

module.exports = updateRouter;