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
    let totalCredits = 0;
  
    for (const term in data) {
      const courses = data[term];
  
      for (const course of courses) {
        totalCredits += course.credits;
      }
    }
    return totalCredits;
  }

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

    const formData = new FormData();
    formData.append("pdf", file);

    // Loading
    setLoading(true)

    // Fetch
    const response = await fetch(`http://localhost:${BACK_PORT}/api/parse`, {
      method: "POST",
      body: formData,
    }).catch((error) => setErr(error));

    const data = await response.json();
    const parsed = JSON.parse(data.transcript)

    // Set transcript data
    setTranscript(parsed);

    // End load
    setLoading(false)
  }

  // Trigger on finished pdf upload
  useEffect(() => {
    const count = countTotalCredits(transcript);
    setCredits(count);
  }, [transcript, loading])


  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Upload a PDF</h1>

      <form onSubmit={handleUpload} style={{ display: "grid", gap: 12 }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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
      
      <h2>Progress: {credits}/120</h2>

      {transcript && (
        <pre style={{ marginTop: 16, padding: 12, overflowX: "auto" }}>
          {JSON.stringify(transcript, null, 2)}
        </pre>
      )}
    </div>
  );
}
