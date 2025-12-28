const logRouter = require("express").Router();
const { getUserLogs } = require("../controllers/admins/adminLogs");

logRouter.post("/get", (req, res) => {
  try {
    getUserLogs(req, res);
  } catch (error) {
    res.send({ success: false, message: error?.message });
  }
});

module.exports = { logRouter };
