// PdfUploadPage.jsx
import { useState } from "react";

export const PdfUploadPage = () => {
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState(null);

  const BACK_PORT = 5050;

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
    const response = await fetch(`http://localhost:${BACK_PORT}/api/parse`, {
      method: "POST",
      body: formData,
    })

    const data = await response.json();
    const parsed = JSON.parse(data.transcript)

    setTranscript(parsed);

    // End load
    setLoading(false)
  }

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

      {transcript && (
        <pre style={{ marginTop: 16, padding: 12, overflowX: "auto" }}>
          {JSON.stringify(transcript, null, 2)}
        </pre>
      )}
    </div>
  );
}
