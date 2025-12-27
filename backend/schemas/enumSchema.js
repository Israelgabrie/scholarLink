const mongoose = require("mongoose");

const enumSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  values: { type: [mongoose.Schema.Types.Mixed], required: true },
}, { timestamps: true });

const EnumSchema = mongoose.model("EnumSchema", enumSchema); // ✅ CommonJS export

module.exports = EnumSchema;
