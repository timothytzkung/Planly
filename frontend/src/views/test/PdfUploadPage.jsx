// PdfUploadPage.jsx
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { PrimaryButton } from "../../components/PrimaryButton"
import { SecondaryButton } from "../../components/SecondaryButton"

export const PdfUploadPage = () => {
  const [file, setFile] = useState(null);
  const [fileIsUploaded, setFileIsUploaded] = useState(false);
  const [reqSummary, setReqSummary] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const [credits, setCredits] = useState(0);

  // nav
  const navigate = useNavigate();

  // Destructure to use contexts
  const { token, user, logout } = useContext(AuthContext);

  // Server 
  const BACK_PORT = 5050;

  // Count credits
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

  const saveToDB = async(e) => {
    e.preventDefault();
    if (transcript) {
      try {
        const res = await fetch(`http://localhost:${BACK_PORT}/api/upload/transcript`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ data: transcript })
        })
        if (res.ok) {
          const result = await res.json();
          console.log(result);
        } else {
          const errData = await res.json();
          alert(errData || "Failed to add transcript");
        }
      } catch (e) {
        console.log("Submission error: ", e);
      }
    }
  }

  // Upload handler
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
    // Format data
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
    setFileIsUploaded(true);

    // End load
    setLoading(false)
  }

  const checkRequirements = async(_degreeType) => {
    console.log("calling backend for checkreqs")
    console.log(transcript);
    const response = await fetch(`http://localhost:${BACK_PORT}/api/check-requirements`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        transcriptData: transcript,
        degreeType: _degreeType
      })
    }).catch((error) => setErr(error));

    const data = await response.json();
    const parsed = JSON.parse(data.result)
    return parsed;
  }

  // Trigger on finished pdf upload
  useEffect(() => {
    const count = countTotalCredits(transcript);
    setCredits(count);

    const handleRequirements = async() => {
      const result = await checkRequirements("BSc");
      console.log(result);
      setReqSummary(result);
    }
    if (fileIsUploaded) {
      handleRequirements();
      console.log(reqSummary)
      setFileIsUploaded(false); // debounce
    }

  }, [transcript, loading, fileIsUploaded, file])

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      { user ? <h1>Hello {user.name}!</h1> : <h1>Hello!</h1>}
      <SecondaryButton label={"Logout"} onClick={logout}/>
      <h2>Upload a PDF</h2>

      <form onSubmit={handleUpload} style={{ display: "grid", gap: 12 }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button disabled={loading}>
          {loading ? "Uploading..." : "Upload & Analyze"}
        </button>
        <PrimaryButton label={"Save to Cloud"} onClick={saveToDB}/>
      </form>

      {err && (
        <div style={{ marginTop: 16, color: "crimson" }}>
          <b>Error:</b> {err}
        </div>
      )}
      <h2>Summary</h2>
      {reqSummary && (
        <pre style={{ marginTop: 16, padding: 12, overflowX: "auto" }}>
          {JSON.stringify(reqSummary, null, 2)}
        </pre>
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
