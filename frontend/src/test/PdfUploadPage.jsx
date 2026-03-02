// PdfUploadPage.jsx
import { useState, useEffect } from "react";

export const PdfUploadPage = () => {
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const [credits, setCredits] = useState(0);

  const BACK_PORT = 5050;

  const countTotalCredits = (data) => {
    if (!data || typeof data !== "object") return 0;

    let totalCredits = 0;

    for (const term in data) {
      const courses = Array.isArray(data[term]) ? data[term] : [];

      for (const course of courses) {
        const c = parseFloat(course.credits) || 0;
        // only count completed courses
        if (course.status !== "completed" && course.status !== undefined) continue;
        totalCredits += c;
      }
    }
    return totalCredits;
  }

  const REQUIRED_CREDITS = 120; // could come from config later

  async function handleUpload(e) {
    e.preventDefault();
    setErr("");

    if (!file) {
      setErr("Please choose a PDF first.");
      return;
    }
    if (file.type !== "application/pdf") {
      setErr("Only PDF files are allowed.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErr("File is too large (max 15 MB).");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:${BACK_PORT}/api/parse`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error: ${response.status} ${text}`);
      }

      const data = await response.json();
      const parsed = JSON.parse(data.transcript);

      setTranscript(parsed);
    } catch (error) {
      console.error(error);
      setErr(error.message ?? "Failed to parse transcript");
    } finally {
      setLoading(false);
    }
  }

  // Trigger when the parsed transcript changes
  useEffect(() => {
    const count = countTotalCredits(transcript);
    setCredits(count);
  }, [transcript]);


  // small helper to render structured output instead of raw JSON
  const TranscriptView = ({ data }) => {
    if (!data || typeof data !== "object") return null;
    const terms = Object.keys(data);
    if (terms.length === 0) return <p>No courses found.</p>;

    return (
      <div style={{ marginTop: 16 }}>
        {terms.map((term) => (
          <div key={term} style={{ marginBottom: 24 }}>
            <h3>{term}</h3>
            <ul>
              {data[term].map((course, idx) => (
                <li key={idx}>
                  <strong>{course["faculty"]} {course["course-number"]}</strong> – {course["course-name"]} ({course.credits} units){' '}
                  {course.grade && `(grade ${course.grade})`}{' '}
                  [{course.status || 'unknown'}]
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Upload a PDF</h1>

      <form onSubmit={handleUpload} style={{ display: "grid", gap: 12 }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            setErr("");
            setFile(e.target.files?.[0] ?? null);
          }}
        />

        <button disabled={loading}>
          {loading ? "Uploading..." : "Upload & Analyze"}
        </button>
      </form>

      {err && (
        <div style={{ marginTop: 16, color: "crimson" }}>
          <b>Error:</b> {err}
        </div>
      )}

      <h2>Progress: {credits}/{REQUIRED_CREDITS}</h2>

      {loading && <p>Parsing transcript, please wait…</p>}

      {transcript && <TranscriptView data={transcript} />}
    </div>
  );
}
