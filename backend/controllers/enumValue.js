const EnumSchema = require("../schemas/enumSchema"); // adjust path
const mongoose = require("mongoose");

async function getFirstEnum(req, res) {
  try {
    // Find the document where name = "basicPlan"
    const enumDoc = await EnumSchema.findOne({ name: "basicPlan" });

    if (!enumDoc) {
      return res.status(404).json({
        success: false,
        message: "No enum document with name 'basicPlan' found",
      });
    }

    return res.status(200).json({
      success: true,
      data: enumDoc,
    });
  } catch (error) {
    console.error("Error in getFirstEnum:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


module.exports = { getFirstEnum };
