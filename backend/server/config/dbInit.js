// =========================
// CONFIG
// =========================
const axios = require("axios");
require("dotenv").config();

// runner
// node dbInit.js

// Course model
const CourseSection = require ("../models/CourseSection");

const MONGO_URI = process.env.MONGO_WQB_URI;
const BASE_URL = "https://www.sfu.ca/bin/wcm/course-outlines";
const YEAR = "2026";
const TERM = "summer";

// All Departments ( I think... )
const TEST_DEPARTMENTS = [
 "arch", "bisc", "bpk", "bus", "ca", "cenv", "chem", "chin", 
  "cmns", "cogs", "crim", "dmed", "easc", "econ", "educ", "engl", "ensc", 
  "evsc", "fal", "fan", "fass", "fep", "fren", "ga", "geog", "gero", "grad", 
  "gsws", "hist", "hsci", "hum", "indg", "inlg", "ins", "is", "japn", 
  "lbrl", "lbst", "ling", "ls", "macm", "masc", "math", "mbb", "mse", "nusc", 
  "phil", "phys", "plan", "plcy", "pol", "psyc", "pub", "rem", "risk", "sa", 
  "sci", "sd", "see", "span", "stat", "tekx", "urb", "wl"
]; // e.g. ["cmpt", "iat"]


// =========================
// HELPERS
// =========================
async function fetchJson(url) {
    const res = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
      timeout: 20000,
    });
    return res.data;
  }
  
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  function normalizeDepartment(dept) {
    return {
      departmentCode: dept.text || "",
      departmentValue: dept.value || "",
      departmentName: dept.name || "",
    };
  }
  
  function normalizeCourse(course, departmentCode) {
    return {
      courseNumber: course.text || "",
      courseValue: course.value || "",
      courseTitle: course.title || "",
      courseCode: `${departmentCode} ${course.text || ""}`.trim(),
    };
  }
  
  function normalizeSection(section) {
    return {
      section: section.text || "",
      sectionValue: section.value || "",
      classType: section.classType || "",
      sectionCode: section.sectionCode || "",
      associatedClass: section.associatedClass || "",
    };
  }
  
  // =========================
  // MAIN SYNC LOGIC
  // =========================
  async function syncCourses() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");
  
    try {
      // API 1: get departments
      const deptUrl = `${BASE_URL}?${YEAR}/${TERM}/`;
      console.log(`Fetching departments from ${deptUrl}`);
      const departments = await fetchJson(deptUrl);
  
      const deptList = TEST_DEPARTMENTS
        ? departments.filter((d) => TEST_DEPARTMENTS.includes((d.value || "").toLowerCase()))
        : departments;
  
      console.log(`Found ${deptList.length} departments`);
  
      for (const dept of deptList) {
        const deptNorm = normalizeDepartment(dept);
  
        if (!deptNorm.departmentValue) {
          console.log("Skipping department with missing value:", dept);
          continue;
        }
  
        try {
          // API 2: get courses in department
          const courseUrl = `${BASE_URL}?${YEAR}/${TERM}/${deptNorm.departmentCode}`;
          console.log(`\n[${deptNorm.departmentCode}] Fetching courses...`);
          const courses = await fetchJson(courseUrl);
          console.log(`[${deptNorm.departmentCode}] ${courses.length} courses found`);
  
          for (const course of courses) {
            const courseNorm = normalizeCourse(course, deptNorm.departmentCode);
  
            if (!courseNorm.courseNumber) {
              console.log(`Skipping course with missing number in ${deptNorm.departmentCode}`);
              continue;
            }
  
            try {
              // API 3: get sections for course
              const sectionUrl = `${BASE_URL}?${YEAR}/${TERM}/${deptNorm.departmentCode}/${courseNorm.courseNumber}`;
              console.log(`  - Fetching sections for ${courseNorm.courseCode}`);
              const sections = await fetchJson(sectionUrl);
              console.log(`    ${sections.length} sections found`);
  
              for (const section of sections) {
                const sectionNorm = normalizeSection(section);
  
                if (!sectionNorm.section) {
                  console.log(`    Skipping section with missing code for ${courseNorm.courseCode}`);
                  continue;
                }
  
                try {
                  // API 4: get full section details
                  const detailUrl = `${BASE_URL}?${YEAR}/${TERM}/${deptNorm.departmentValue}/${courseNorm.courseValue}/${sectionNorm.sectionValue}`;
                  console.log(`    > Fetching details for ${courseNorm.courseCode} ${sectionNorm.section}`);
  
                  const detail = await fetchJson(detailUrl);
  
                  const doc = {
                    year: YEAR,
                    term: TERM,
                    termLabel: detail?.info?.term || `${TERM} ${YEAR}`,
  
                    ...deptNorm,
                    ...courseNorm,
                    ...sectionNorm,
  
                    info: detail?.info || {},
                    instructor: Array.isArray(detail?.instructor) ? detail.instructor : [],
                    courseSchedule: Array.isArray(detail?.courseSchedule) ? detail.courseSchedule : [],
                    examSchedule: Array.isArray(detail?.examSchedule) ? detail.examSchedule : [],
                    requiredText: Array.isArray(detail?.requiredText) ? detail.requiredText : [],
  
                    lastSyncedAt: new Date(),
                  };
  
                  await CourseSection.findOneAndUpdate(
                    {
                      year: doc.year,
                      term: doc.term,
                      departmentCode: doc.departmentCode,
                      courseNumber: doc.courseNumber,
                      section: doc.section,
                    },
                    { $set: doc },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                  );
  
                  console.log(`    Saved ${doc.courseCode} ${doc.section}`);
                  await sleep(200); // light delay to be polite to the API
                } catch (err) {
                  console.error(
                    `    Failed detail fetch/save for ${courseNorm.courseCode} ${sectionNorm.section}:`,
                    err.message
                  );
                }
              }
            } catch (err) {
              console.error(`  Failed sections fetch for ${courseNorm.courseCode}:`, err.message);
            }
          }
        } catch (err) {
          console.error(`Failed course fetch for department ${deptNorm.departmentCode}:`, err.message);
        }
      }
  
      console.log("\nSync complete.");
    } finally {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB.");
    }
  }
  
  syncCourses().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });