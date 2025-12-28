const inviteRouter = require("express").Router();
const {
  createAndSendInvite,
  getInvites,
  deleteInvite,
  editInvite,
  createUserFromInvite,
} = require("../controllers/admins/inviteLink");

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

inviteRouter.post("/create", (req, res) => {
  try {
    createAndSendInvite(req, res);
  } catch (error) {
    res.send({ success: true, message: error?.message });
  }
});

inviteRouter.post("/get", (req, res) => {
  try {
    getInvites(req, res);
  } catch (error) {
    res.send({ success: true, message: error?.message });
  }
});

inviteRouter.post("/delete", (req, res) => {
  try {
    deleteInvite(req, res);
  } catch (error) {
    res.send({ success: true, message: error?.message });
  }
});

inviteRouter.post("/edit", (req, res) => {
  try {
    editInvite(req, res);
  } catch (error) {
    res.send({ success: true, message: error?.message });
  }
});

inviteRouter.post(
  "/add-user",
  upload.single("userImage"),
  createUserFromInvite
);

module.exports = { inviteRouter };
