// Serves as entry point
import { createRequire } from "module";
const require = createRequire(import.meta.url);


import { PDFParse } from 'pdf-parse';

// Third party dependencies
const express = require('express');
const multer = require("multer");
const cors = require("cors"); // Import the CORS package
const mongoose = require("mongoose");
require("dotenv").config();

// Routes
const sfuCourseRoutes = require('./routes/sfuCourses')
const authRoutes = require("./routes/auth")
const transcriptRoutes = require("./routes/transcript");

// Models
const Summary = require("./models/Summary");

// In-house functions
import { parseTranscriptByTerm } from "./utils/parse.js";
import { transcriptAnalyzer } from "./controllers/transcriptAnalyzer.js";
const verifyToken = require("./middleware/authMiddleware");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Mongo Bongo
const PORT = 5050;
const FRONT_PORT = 5173;
const mongoUri = process.env.MONGO_WQB_URI;
// const mongo_WQB_URI = process.env.mongo_WQB_URI;

// Middleware to parse JSON
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: `http://localhost:${FRONT_PORT}`,
  }),
);

// Mongo DB
const clientOptions = {
  serverApi: {
    version: "1", strict: true, deprecationErrors: true
  },
};

// Database connection
async function connectDB() {
  try {
    await mongoose.connect(mongoUri, clientOptions);

    // optional: the "Ping" command just confirms everything is working
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("✅ Pinged the db. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("❌ Connection failed:", err);
    // If the DB is down, we might want to stop the server
    // process.exit(1);
  }
}

// execute the connection function
connectDB();

/*
################################################
API Ports
################################################
*/

// Parse API route (req includes => {formData})
app.post("/api/parse", upload.single("pdf"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file seen" });

  // Convert to bytes
  const bytes = new Uint8Array(req.file.buffer); // Uint8Array

  // Parse
  const parser = new PDFParse({ data: bytes });
  const result = await parser.getText();
  await parser.destroy();

  // Get text
  const text = result.text;
  const courses = parseTranscriptByTerm(text);

  // Stringify results
  const fin = JSON.stringify(courses, null, 2);
  res.json({ transcript: fin });
});

// Check requirements stuff (generates summary)
app.post("/api/check-requirements", async (req, res) => {
  if (!req.body) return res.status(400).json({ error: "No body attached" });

  // Destruct
  const { transcriptData, degreeType, owner } = req.body;
  const result = await transcriptAnalyzer(transcriptData, owner);

  // Remove existing summaries if exists
  try {
    const exists = await Summary.findOneAndDelete({owner: owner.id})
    } catch (e) {
    console.log("No existing summary!")
  }

  const summaryDoc = new Summary(result);
  await summaryDoc.save();

  // Check
  console.log(summaryDoc);
  const fin = JSON.stringify(summaryDoc, null, 2);

  res.json({ result: fin });
})

// Fetch summary
app.post("/api/summary/", async(req, res) => {
  if (!req.body) return res.status(400).json({ error: "No body attached" });

  console.log(req.body.data);


  try {
    // Replace transcript if one already exists
    const exists = await Summary.findOneAndDelete({
      owner: req.body.data.id
  })
    // Look for transcript via userid
    const summary = await Summary.findOne({ owner: req.body.data.id });

    if (!summary) {
      return res.status(404).json({ message: "No summary found" });
    }
    res.status(200).json(summary);
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Internal server error",
      error: e.message,
    });
  }
})

// API
app.use("/api/sfuCourses", sfuCourseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transcript", transcriptRoutes);

// Listen
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
