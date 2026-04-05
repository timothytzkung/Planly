
const express = require("express");
const router = express.Router();
const WQBCourse = require("../models/wqbCourse");
const CourseSection = require("../models/CourseSection");
const Review = require("../models/Review")
const { GenerateSchedule } = require("../controllers/scheduleGenerator");
const {verifyToken} = require("../middleware/authMiddleware");

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
    const {
      page = 1,
      limit = 7,
      search = "",
      departmentCode,
      level,
      designation,
      noPrereqs,
      deliveryMethod,
    } = req.query;

    const query = {};
    const andConditions = [];

    if (search.trim()) {
      andConditions.push({
        $or: [
          { courseCode: { $regex: search, $options: "i" } },
          { courseTitle: { $regex: search, $options: "i" } },
          { "info.description": { $regex: search, $options: "i" } },
          { departmentCode: { $regex: search, $options: "i" } },
        ],
      });
    }

    if (departmentCode) {
      andConditions.push({
        departmentCode: { $regex: `^${departmentCode}$`, $options: "i" },
      });
    }

    if (level === "upper") {
      andConditions.push({
        courseNumber: { $regex: "^[3-4][0-9]{2}[A-Z]?$", $options: "i" },
      });
    }

    if (designation) {
      andConditions.push({
        "info.designation": { $regex: designation, $options: "i" },
      });
    }

    if (noPrereqs === "true") {
      andConditions.push({
        $or: [
          { "info.prerequisites": "" },
          { "info.prerequisites": null },
        ],
      });
    }

    if (deliveryMethod) {
      andConditions.push({
        "info.deliveryMethod": { $regex: deliveryMethod, $options: "i" },
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      CourseSection.find(query).skip(skip).limit(limitNum).lean(),
      CourseSection.countDocuments(query),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch courses",
    });
  }
});

// Add Favourite Courses
router.post("/favourites/:courseId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // assuming verifyToken attaches user info
    const { courseId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favourites: courseId } },
      { new: true }
    ).populate("favourites");

    res.status(200).json(updatedUser.favourites);
  } catch (error) {
    res.status(500).json({ error: "Failed to add favourite course." });
  }
});

// Remove a course from favourites
router.delete("/favourites/:courseId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { favourites: courseId } },
      { new: true }
    ).populate("favourites");

    res.status(200).json(updatedUser.favourites);
  } catch (error) {
    res.status(500).json({ error: "Failed to remove favourite course." });
  }
});

// Get all favourite courses
router.get("/favourites", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favourites");

    res.status(200).json(user.favourites);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch favourite courses." });
  }
});

// Makes a schedule based off incoming course codes
router.post("/make-schedule", async (req, res) => {
  try {
    const { courses } = req.body;

    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({
        error: "Request body must include a non-empty 'courses' array",
      });
    }

    const normalizedCourses = [...new Set(
      courses.map((course) => course.trim().toUpperCase().replace(/\s+/g, " "))
    )];

    // Fetch first section for each requested course
    const rawCourses = await Promise.all(
      normalizedCourses.map(async (courseCode) => {
        return await CourseSection.findOne({ courseCode })
          .sort({ section: 1 }) // picks the "first" section consistently
          .lean();
      })
    );

    const validCourses = rawCourses.filter(Boolean);
    const foundCourses = validCourses.map((course) => course.courseCode);
    const missingCourses = normalizedCourses.filter(
      (code) => !foundCourses.includes(code)
    );

    if (validCourses.length === 0) {
      return res.status(404).json({
        error: "No matching courses found",
        missingCourses,
      });
    }
    const schedule = GenerateSchedule(validCourses);

    return res.status(200).json({
      schedule,
      foundCourses,
      missingCourses,
    });
  } catch (e) {
    return res.status(500).json({
      error: e.message || "Internal server error",
    });
  }
});

// Post a review
router.post("/review", async (req, res) => {
  console.log("Review backend pinged!");
  console.log("req.body:", req.body);

  const { userId, text, rating, courseCode, date } = req.body;

  if (!userId || !text || rating == null || !courseCode) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  try {
    const newReview = new Review({
      owner: userId,
      courseCode,
      rating,
      text,
      date,
    });

    await newReview.save();

    return res.status(200).json({
      message: "Review saved!",
      review: newReview,
    });
  } catch (err) {
    console.error("Save error:", err);
    return res.status(400).json({
      message: "Error saving post",
      error: err.message,
    });
  }
});


// Get all reviews for some course
router.get("/reviews", async (req, res) => {
  try {
    const { courseCode } = req.query;
    const _reviews = await Review.find({ courseCode: courseCode });

    res.status(200).json({ reviews: _reviews });
  } catch (e) {
    console.log("Error fetching reviews: ", e);
    res.status(500).json({ error: e });
  }
});

module.exports = router;