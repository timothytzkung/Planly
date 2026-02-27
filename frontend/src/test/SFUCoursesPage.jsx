// PdfUploadPage.jsx
import { useState, useEffect } from "react";

export const SFUCoursesPage = () => {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState(null);

  const BACK_PORT = 5050;

  const getCourses = async() => {
    // Load to prevent additional uploads
    setLoading(true);

    // Fetch
    const response = await fetch(`http://localhost:${BACK_PORT}/api/courses`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        year: "2026",
        term: "summer",
        department: "iat"
      })
    }).catch((error) => setErr(error));

    // Incoming response already parsed by API
    const data = await response.json();
    setCourses(data)

    // End loading
    setLoading(false);
  }

  // Load on mount
  useEffect(() => {
    getCourses();
  }, [])

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h2>Course List</h2>
      {courses && (
        <pre style={{ marginTop: 16, padding: 12, overflowX: "auto" }}>
          {JSON.stringify(courses, null, 2)}
        </pre>
      )}
    </div>
  );
}
