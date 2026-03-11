
const express = require("express");
const router = express.Router();
const WQBCourse = require("../models/wqbCourse");

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

// Breadth Courses from DB
router.get("/breadth-courses", async (req, res) => {

  try {
    const _courses = await WQBCourse.find();
    res.status(200).json({ courses: _courses })
  } catch (e) {
    console.log("Error fetching WQB Courses in Backend: ", e);
    res.status(500).json({erorr: e});
  }
})

module.exports = router;