

const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courseCode: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    date: {
        type: String
    },
    flagged: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Review", ReviewSchema, "reviews");