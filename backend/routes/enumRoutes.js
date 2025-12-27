const { getFirstEnum} = require("../controllers/enumValue")
const { authenticateUser } = require("../middleware/middlewareAuth");

const enumRoutes = require("express").Router();

// ✅ Protected route with middleware
enumRoutes.get("/fetch-enum", authenticateUser, (req, res) => {
  try {
    getFirstEnum(req, res);
  } catch (error) {
    res.status(500).send({ message: error?.message, success: false });
  }
});

module.exports = { enumRoutes };
