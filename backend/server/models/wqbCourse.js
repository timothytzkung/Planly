const mongoose = require("mongoose");

// Schema specifically for checking wqb requirements (pulled from separate SFU page)
const wqbCourseSchema = new mongoose.Schema({
  courseNumber: { type: String, required: true, unique: true, index: true },
  credits: Number,
  courseTitle: String,
  designations: { type: [String], default: [], index: true }
});

module.exports = mongoose.model("WQBCourse", wqbCourseSchema, "courses");