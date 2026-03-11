
const express = require("express");
const router = express.Router();
const WQBCourse = require("../models/wqbCourse");
const CourseSection = require("../models/CourseSection")

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
    res.status(500).json({ erorr: e });
  }
})

// Fetches available courses in summer 2026 (just for now, idk if will add later)
router.get("/available-courses", async (req, res) => {
  try {
    // Limit by pages & set default vals
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || "";

    // page skip
    const skip = (page - 1) * limit;

    // mongodb query 
    const query = search
      ? {
        $or: [
          { courseTitle: { $regex: search, $options: "i" } },
          { courseCode: { $regex: search, $options: "i" } }
        ]
      }
      : {};

    // only return when promises all fulfilled
    const [items, total] = await Promise.all([
      CourseSection.find(query).skip(skip).limit(limit).lean(),
      CourseSection.countDocuments(query)
    ]);

    res.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

module.exports = router;