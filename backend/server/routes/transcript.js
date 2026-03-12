
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

// Fetches transcripts if one exists
router.post("/", verifyToken, async (req, res) => {
    try {
        // Look for transcript via userid
      const transcript = await Transcript.findOne({ owner: req.userId });
  
      if (!transcript) {
        return res.status(404).json({ message: "No transcript found" });
      }
      res.status(200).json(transcript);
    } catch (e) {
      res.status(500).json({
        message: "Internal server error",
        error: e.message,
      });
    }
  });

// Upload Transcript
router.post("/upload", verifyToken, async (req, res) => {
    const { data } = req.body;
    try {
        // Replace transcript if one already exists
        const exists = await Transcript.findOneAndDelete({
            owner: req.userId
        })

        // Explicity mapping of body to transcript schema
        const mappedTranscript = mapTranscriptData(data);

        const transcriptDoc = new Transcript({
            owner: req.userId,
            transcript: mappedTranscript
        });
        await transcriptDoc.save();
        res.status(201).json(transcriptDoc);
    } catch (err) {
        res.status(400).json({ message: "Error saving transcript", error: err.message })
    }
})

// Delete transcripts by userid
router.delete("/", verifyToken, async (req, res) => {
    try {
        // Search transcript by owner id
        const deleted = await Transcript.findOneAndDelete({
            owner: req.userId
        });

        // Check if there is a transcript
        if (!deleted) {
            return res.status(404).json({ message: "No transcript found" });
        }
        res.json({ message: "Transcript successfully deleted" });

    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

module.exports = router;