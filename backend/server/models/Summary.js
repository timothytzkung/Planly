const mongoose = require('mongoose');
const { Schema } = mongoose;

// Reusable sub-schema for WQB courses since they share a very similar structure 
// but occasionally mix 'term' and 'season' keys
const WQBCourseSchema = new Schema({
    code: String,
    name: String,
    credits: Number,
    grade: String,
    year: Number,
    season: String,
    term: String,
    level: Number
}, { _id: false });

const SummarySchema = new Schema({
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
  
    degree: {
      id: String,
      name: String
    },
  
    summary: {
      studentStatus: String,
      creditsCompleted: Number,
      creditsInProgress: Number,
      creditsRemaining: Number,
      percentComplete: Number,
      gpa: {
        overall: Number,
        major: Number,
        meetsRequirements: Boolean
      },
      requirements: {
        total: Number,
        completed: Number,
        remaining: Number
      },
      estimatedGraduation: String,
      termsCompleted: Number
    },
  
    gpa: Schema.Types.Mixed,
  
    requirements: {
      type: Map,
      of: Schema.Types.Mixed
    },
  
    recommendations: [Schema.Types.Mixed],
  
    timeline: {
      type: Map,
      of: Schema.Types.Mixed
    }
  }, {
    timestamps: true
  });

module.exports = mongoose.model('Summary', SummarySchema, "summaries");