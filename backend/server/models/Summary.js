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
        estimatedGraduation: String,
        termsCompleted: Number
    },

    gpa: {
        overall: {
            gpa: Number,
            credits: Number,
            courses: Number,
            meetsMinimum: Boolean
        },
        major: {
            gpa: Number,
            credits: Number,
            courses: Number,
            meetsMinimum: Boolean
        },
        // Map is used here because the keys (e.g., "2020 Fall") are dynamic
        byTerm: {
            type: Map,
            of: String
        },
        gradeDistribution: {
            "A+": Number,
            "A": Number,
            "A-": Number,
            "B+": Number,
            "B": Number,
            "B-": Number,
            "C+": Number,
            "C": Number,
            "C-": Number,
            "D": Number,
            "F": Number
        }
    },

    requirements: {
        lowerDivisionRequired: {
            name: String,
            required: Number,
            completed: Number,
            inProgress: Number,
            creditsRequired: Number,
            creditsCompleted: Number,
            isMet: Boolean,
            status: [{
                _id: false,
                course: String,
                completed: Boolean,
                inProgress: Boolean,
                grade: String
            }],
            missing: [Schema.Types.Mixed] // Accepts any type for future-proofing empty arrays
        },
        lowerDivisionElectives: {
            name: String,
            required: Number,
            completed: Number,
            inProgress: Number,
            creditsRequired: Number,
            creditsCompleted: Number,
            isMet: Boolean,
            courses: [{
                _id: false,
                code: String,
                name: String,
                credits: Number,
                grade: String,
                status: String
            }],
            missing: Number
        },
        upperDivisionRequired: {
            name: String,
            required: Number,
            completed: Number,
            inProgress: Number,
            creditsRequired: Number,
            creditsCompleted: Number,
            isMet: Boolean,
            course: Schema.Types.Mixed // Typed as Mixed to allow for `null` or a future course object
        },
        upperDivisionScience: {
            name: String,
            creditsRequired: Number,
            creditsCompleted: Number,
            creditsInProgress: Number,
            isMet: Boolean,
            courses: [{
                _id: false,
                code: String,
                name: String,
                credits: Number,
                grade: String, // Mongoose inherently allows String fields to be null
                status: String
            }],
            creditsNeeded: Number
        },
        fourHundredLevel: {
            name: String,
            required: Number,
            completed: Number,
            inProgress: Number,
            isMet: Boolean,
            courses: [{
                _id: false,
                code: String,
                name: String,
                credits: Number,
                grade: String,
                status: String
            }],
            note: String
        },
        wqb: {
            writing: {
                required: Number,
                completed: Number,
                isMet: Boolean,
                hasUpperDivInMajor: Boolean,
                courses: [WQBCourseSchema]
            },
            quantitative: {
                required: Number,
                completed: Number,
                isMet: Boolean,
                courses: [WQBCourseSchema]
            },
            breadth: {
                science: {
                    required: Number,
                    completed: Number,
                    isMet: Boolean,
                    courses: [WQBCourseSchema]
                },
                socialScience: {
                    required: Number,
                    completed: Number,
                    isMet: Boolean,
                    courses: [WQBCourseSchema]
                },
                humanities: {
                    required: Number,
                    completed: Number,
                    isMet: Boolean,
                    courses: [WQBCourseSchema]
                },
                additional: {
                    required: Number,
                    completed: Number,
                    isMet: Boolean,
                    courses: [WQBCourseSchema]
                }
            }
        },
        overall: {
            totalCredits: {
                required: Number,
                completed: Number,
                inProgress: Number,
                total: Number,
                remaining: Number,
                percentComplete: Number
            },
            upperDivision: {
                required: Number,
                completed: Number,
                inProgress: Number,
                total: Number,
                remaining: Number
            },
            upperDivisionMajor: {
                unitsRequired: Number,
                unitsCompleted: Number,
                unitsInProgress: Number,
                coursesRequired: Number,
                coursesCompleted: Number,
                meetsUnits: Boolean,
                meetsCourses: Boolean
            }
        }
    },

    recommendations: [{
        _id: false,
        priority: String,
        category: String,
        message: String,
        suggestion: String,
        progress: String,
        remaining: [Schema.Types.Mixed]
    }],

    // Map is used here because keys like "2020 Fall" will change per student/term
    timeline: {
        type: Map,
        of: new Schema({
            courses: [{
                _id: false,
                code: String,
                name: String,
                credits: Number,
                grade: String,
                status: String
            }],
            totalCredits: Number,
            completedCredits: Number,
            averageGrade: [String]
        }, { _id: false })
    }
}, {
    timestamps: true // Highly recommended to track when these summaries are created/updated
});

module.exports = mongoose.model('Summary', SummarySchema, "summaries");