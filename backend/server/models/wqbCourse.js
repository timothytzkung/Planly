const mongoose = require("mongoose");

const wqbCourseSchema = new mongoose.Schema({
  courseNumber: { type: String, required: true, unique: true, index: true },
  credits: Number,
  courseTitle: String,
  designations: { type: [String], default: [], index: true }
});

module.exports = mongoose.model("WQBCourse", wqbCourseSchema, "courses");