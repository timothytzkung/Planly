// Serves as entry point
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { PDFParse } from "pdf-parse";
import { parseTranscript } from "./utils/parse.js";
const express = require("express");
const multer = require("multer");
const cors = require("cors"); // Import the CORS package

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const PORT = 5050;
const FRONT_PORT = 5173;

// Middleware to parse JSON
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: `http://localhost:${FRONT_PORT}`,
  }),
);

// Hello API route
app.get("/api/hello", (req, res) => {
  console.log("I'm running hello!");
  res.json({ message: "Hello from the Node backend!" });
});

// Parse API route
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
  const courses = parseTranscript(text);

  // Stringify results
  const fin = JSON.stringify(courses, null, 2);
  console.log(fin);
  res.json({ transcript: fin });
});

// Listen
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
