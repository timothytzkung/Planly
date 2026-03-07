

const mongoose = require("mongoose");

const TranscriptSchema = new mongoose.Schema({
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    transcript: [
      {
        term: String,
        courses: [
          {
            courseName: String,
            faculty: String,
            courseNumber: String,
            credits: Number,
            grade: String,
            classAverage: String,
            classSize: Number,
            status: String
          }
        ]
      }
    ]
  });

module.exports = mongoose.model("Transcript", TranscriptSchema, "transcripts");