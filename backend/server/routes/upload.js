
const express = require("express");
const router = express.Router();
const Transcript = require("../models/Transcript");
const verifyToken = require("../middleware/authMiddleware");


// Helper function for mapping incoming transcript data
function mapTranscriptData(data) {
    return Object.entries(data).map(([term, courses]) => ({
        term: term,
        courses: courses
    }));
}

// Upload Transcript
router.post("/transcript", verifyToken, async (req, res) => {
    const { data } = req.body;
    try {
        // Explicity mapping of body to transcript schema
        const mappedTranscript = mapTranscriptData(data);

        const transcriptDoc = new Transcript({
            owner: req.userId,
            transcript: mappedTranscript
        });
        await transcriptDoc.save();
        res.status(201).json(transcriptDoc);
    } catch (err) {
        res.status(400).json({ message: "Error saving transcript", error: err.message})
    }
})

module.exports = router;