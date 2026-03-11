

import { Dashboard } from "../../components/Dashboard";
import { Sidebar } from "../../components/Sidebar";

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import styles from "./DashboardView.module.css"

export const DashboardView = () => {

    // Handlers for file states
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
    const { token, user, logout, updateUser } = useContext(AuthContext);

    // Server 
    const BACK_PORT = 5050;

    // fetch summaries
    const fetchSummary = async() => {
        try {
            const res = await fetch(`http://localhost:${BACK_PORT}/api/summary/`, {
                method: "POST",
                headers: {
                    "Content-Type":  "application/json"
                },
                body: JSON.stringify({data: user})
            });
            if (res.ok) {
                const result = await res.json();
                return result;
            }
        } catch (e) {
            console.log("Error fetching summary: ", e);
        }
    }

    // fetch the transcript
    const fetchTranscript = async() => {
        try {
            const res = await fetch(`http://localhost:${BACK_PORT}/api/transcript/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({ userId: user.id })
            });
            if (res.ok) {
                const result = await res.json();
                return result //structure is {_id, owner, transcript:array}
            }
        } catch(e) {
            console.log("Error fetching transcript: ", e);
            return -1;
        }
    }

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

    const saveToDB = async (parsedTranscript) => {
        if (parsedTranscript) {
            try {
                const res = await fetch(`http://localhost:${BACK_PORT}/api/transcript/upload`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                    body: JSON.stringify({ data: parsedTranscript })
                });
    
                if (res.ok) {
                    const result = await res.json();
                    console.log("Transcript saved!")
                } else {
                    const errData = await res.json();
                    // alert(errData.message || "Failed to add transcript");
                }
            } catch (e) {
                console.log("Submission error: ", e);
            }
        } else {
            setErr("Please upload a transcript first!")
        }
    };

    const deleteFromDB = async () => {
        // Searches for transcript by owner id
        try {
            const res = await fetch(`http://localhost:${BACK_PORT}/api/transcript/`, {
                method: "DELETE",
                headers: {
                    Authorization: token,
                }
            });
            if (res.ok) {
                alert("Your transcript has been deleted!")
            } else {
                alert("You have no transcripts to delete!")
            }
        } catch (err) {
            console.log("Delete error:", err);
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
    
        const formData = new FormData();
        formData.append("pdf", file);
    
        setLoading(true);
    
        try {
            const response = await fetch(`http://localhost:${BACK_PORT}/api/parse`, {
                method: "POST",
                body: formData,
            });
    
            const data = await response.json();
            const parsed = JSON.parse(data.transcript);
    
            setTranscript(parsed);
            setFileIsUploaded(true);
    
            await saveToDB(parsed);
        } catch (error) {
            setErr(error.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    }
    

    const checkRequirements = async (_degreeType) => {
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
                degreeType: _degreeType,
                owner: user
            })
        }).catch((error) => setErr(error));

        const data = await response.json();
        const parsed = JSON.parse(data.result)
        return parsed;
    }

    // Trigger on finished pdf upload
    useEffect(() => {
        if (!transcript) {
            // const handleFetchTranscript = async() => {
            //     const result = await fetchTranscript();
            //     console.log(result);
            //     setTranscript(result);
            // }
            // handleFetchTranscript();
        }
        if (!reqSummary && user) {
            const handleFetchSummary = async() => {
                const result = await fetchSummary();
                setReqSummary(result);
            }
            handleFetchSummary();
        }

        if (transcript) {
            const count = countTotalCredits(transcript);
            setCredits(count);
        }

        const handleRequirements = async () => {
            const result = await checkRequirements("BSc");
            setReqSummary(result);
        }
        if (fileIsUploaded) {
            handleRequirements();
            setFileIsUploaded(false); // debounce
        }

    }, [transcript, loading, fileIsUploaded, file])
    return (
        <div className={styles.layout}>
            <Sidebar />
            <Dashboard 
                uploadTranscript={handleUpload} 
                setFile={setFile} 
                file={file}
                setTranscript={setTranscript}
                transcript={transcript}
                summary={reqSummary}
                _error={err}
            />
            
            {/* {err && (
        <div style={{ marginTop: 16, color: "crimson" }}>
          <b>Error:</b> {err}
        </div>
      )}
            {transcript && (
        <pre style={{ marginTop: 16, padding: 12, overflowX: "auto" }}>
          {JSON.stringify(transcript, null, 2)}
        </pre>
      )} */}
        </div>

    )
}