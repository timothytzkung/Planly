// PdfUploadPage.jsx
import { useState, useEffect } from "react";

export const SFUCoursesPage = () => {
  const [err, setErr] = useState("");
  const [courses, setCourses] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);
  const [courseOutline, setCourseOutline] = useState(null)

  const BACK_PORT = 5050;

  // Get all courses from specific dept in that year
  const getCourses = async(_year, _term, _department) => {
    // Fetch
    const response = await fetch(`http://localhost:${BACK_PORT}/api/courses`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        year: _year,
        term: _term,
        department: _department
      })
    }).catch((error) => setErr(error));

    // Incoming response already parsed by API
    const data = await response.json();
    setCourses(data);
  }

  // get specific course info (returns all course sections available in that term)
  const getCourseInfo = async(_year, _term, _department, _courseNumber) => {
    // Fetch
    const response = await fetch(`http://localhost:${BACK_PORT}/api/course-sections`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        year: _year,
        term: _term,
        department: _department,
        courseNumber: _courseNumber
      })
    }).catch((error) => setErr(error));

    // Incoming
    const data = await response.json();
    setCourseInfo(data);
  }

  // gets specific course outline ==> returns info about course, instructor, schedule, reqs, etc.
  const getCourseOutline = async(_year, _term, _department, _courseNumber, _courseSection) => {
    // Fetch
    const response = await fetch(`http://localhost:${BACK_PORT}/api/course-outline`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        year: _year,
        term: _term,
        department: _department,
        courseNumber: _courseNumber,
        courseSection: _courseSection
      })
    }).catch((error) => setErr(error));

    // Incoming
    const data = await response.json();
    setCourseOutline(data);
  }

  // Load on mount
  useEffect(() => {
    getCourses("2026", "summer", "IAT");
    getCourseInfo("2026", "summer", "IAT", "339");
    getCourseOutline("2026", "summer", "IAT", "339", "b100");
  }, [])

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>

      <h2>Course Outline Info</h2>
      { courseOutline && (
        <pre style={{ marginTop: 16, padding: 12, overflowX: "auto" }} >
          {JSON.stringify(courseOutline, null, 2)}
        </pre>
      )}

      <h2>Course Section Info</h2>
      { courseInfo && (
        <pre style={{ marginTop: 16, padding: 12, overflowX: "auto" }} >
          {JSON.stringify(courseInfo, null, 2)}
        </pre>
      )}

      <h2>Course List</h2>
      {courses && (
        <pre style={{ marginTop: 16, padding: 12, overflowX: "auto" }}>
          {JSON.stringify(courses, null, 2)}
        </pre>
      )}
    </div>
  );
}
