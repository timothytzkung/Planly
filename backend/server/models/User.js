const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    _id: ObjectId,
    username: {
        type: String,
        required: true,
        unique: true, // no two users can have the same name
    },
    password: {
        type: String,
        required: true,
    },
    name: String,
    email: String,
    profilePictureUrl: String,
    program: String, // e.g., "SIAT", "Computing Science"
    major: String,
    concentration: [String],
    isAdmin: Boolean,
    createdAt: Date,
    updatedAt: Date,
    savedCourses: [String], // Array of course codes
    transcriptUploaded: Boolean,
    transcriptData: { // Might add transcript schema for summary? idk
        uploadDate: Date,
        fileName: String,
        summary: String //  Currently gonna just stringify the JSON
    }
});

module.exports = mongoose.model("User", UserSchema);