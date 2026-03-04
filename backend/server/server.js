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

// In-house functions
import { parseTranscriptByTerm } from "./utils/parse.js";
import { transcriptAnalyzer } from "./controllers/transcriptAnalyzer.js";

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


// Hello API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the Node backend!" });
});

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

// SFU API courses in dept. route (req includes => {year, term, department })
app.post("/api/courses", async (req, res) => {
  if (!req.body) return res.status(400).json({ error: "No body attached" });

  // Destruct
  const { year, term, department } = req.body;

  // Fetch
  const url = `http://www.sfu.ca/bin/wcm/course-outlines?${year}/${term}/${department}`
  const response = await fetch(url, {
    method: "GET"
  })
  // No parsing needed because SFU api parsed it already
  const data = await response.json();
  res.json({ courses: data });
})

// SFU API course sections route (req includes => {year, term, department, courseNumber})
app.post("/api/course-sections", async (req, res) => {
  if (!req.body) return res.status(400).json({ error: "No body attached" });

  // Destruct
  const { year, term, department, courseNumber } = req.body;

  // Fetch
  const url = `http://www.sfu.ca/bin/wcm/course-outlines?${year}/${term}/${department}/${courseNumber}`
  const response = await fetch(url, {
    method: "GET"
  })
  // No parsing needed because SFU api parsed it already
  const data = await response.json();
  res.json({ courses: data });
})

// SFU API course outline route (req includes => {year, term, department, courseNumber, courseSection})
app.post("/api/course-outline", async (req, res) => {
  if (!req.body) return res.status(400).json({ error: "No body attached" });

  // Destruct
  const { year, term, department, courseNumber, courseSection } = req.body;

  // Fetch
  const url = `http://www.sfu.ca/bin/wcm/course-outlines?${year}/${term}/${department}/${courseNumber}/${courseSection}`
  const response = await fetch(url, {
    method: "GET"
  })
  // No parsing needed because SFU api parsed it already
  const data = await response.json();
  res.json({ courses: data });
})


app.post("/api/check-requirements", async (req, res) => {
  if (!req.body) return res.status(400).json({ error: "No body attached" });

  // Destruct
  const { transcriptData, degreeType } = req.body;
  const result = await transcriptAnalyzer(transcriptData);

  // Check
  console.log(result);
  const fin = JSON.stringify(result, null, 2);

  res.json({ result: fin });
})

// Listen
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
