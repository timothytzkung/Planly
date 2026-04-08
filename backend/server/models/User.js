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
    favourites: [
        {   type: mongoose.Schema.Types.ObjectId,
            ref: "CourseSection",
        }
    ],
    role: {
        type: String, 
        enum: ['member', 'admin'], // Guarantees that only these specific values can be saved
        default: 'member' // Every new registration gets lowest priv.
    }
});

module.exports = mongoose.model("User", UserSchema, "users");