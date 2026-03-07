const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // no two users can have the same name
    },
    studentID: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    transcriptData: { // Might add transcript schema for summary? idk
        uploadDate: Date,
        data: String //  Currently gonna just stringify the JSON
    }
});

module.exports = mongoose.model("User", UserSchema, "users");