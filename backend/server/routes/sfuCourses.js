
const express = require("express");
const router = express.Router();

// SFU API courses in dept. route (req includes => {year, term, department })
router.post("/courses", async (req, res) => {
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
router.post("/course-sections", async (req, res) => {
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
router.post("/course-outline", async (req, res) => {
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

module.exports = router;