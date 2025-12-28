const updateRouter = require("express").Router();
const { updateAdminUser } = require("../controllers/admins/adminUpdateUser");
const multer = require("multer");

const storage = multer.memoryStorage(); // ← Just temporary RAM storage
const upload = multer({ storage: storage });

updateRouter.post(
  "/admin",
  upload.fields([
    { name: "userImage", maxCount: 1 },
    { name: "schoolImage", maxCount: 1 },
  ]),
  updateAdminUser
);

module.exports = updateRouter;
