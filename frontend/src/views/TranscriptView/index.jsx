import styles from "./TranscriptView.module.css";

import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { Sidebar } from "../../components/Sidebar";
import { Schedule } from "../../components/Schedule";
import { TranscriptCard } from "../../components/TranscriptCard/TranscriptCard";
import { AuthContext } from "../../context/AuthContext";

export const TranscriptView = () => {
    const [transcript, setTranscript] = useState(null);
    const [lastParsed, setLastParsed] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [file, setFile] = useState(null);

    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const BACK_PORT = 5050;

    // Fetch transcript from backend
    const fetchTranscript = async () => {
        if (!user || !token) return;

        try {
            setLoading(true);
            const res = await fetch(`http://localhost:${BACK_PORT}/api/transcript/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({ userId: user.id })
            });

            if (res.ok) {
                const data = await res.json();
                setTranscript(data);
                
                // Format last parsed date
                if (data.updatedAt) {
                    const date = new Date(data.updatedAt);
                    const formatted = date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    setLastParsed(formatted);
                }
            } else if (res.status === 404) {
                setTranscript(null);
            } else {
                setError("Failed to load transcript");
            }
        } catch (err) {
            console.error("Error fetching transcript:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Save transcript to database
    const saveToDB = async (parsedTranscript) => {
        if (!parsedTranscript) {
            setError("Please upload a transcript first!");
            return;
        }

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
                setTranscript(result);
                setError(null);
                
                // Format last parsed date
                const date = new Date();
                const formatted = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                setLastParsed(formatted);
            } else {
                const errData = await res.json();
                setError(errData.message || "Failed to upload transcript");
            }
        } catch (e) {
            console.error("Submission error:", e);
            setError("Error uploading transcript");
        }
    };

    // Handle file upload
    const handleUpload = async (fileToUpload) => {
        setError("");

        if (!fileToUpload) {
            setError("Please choose a PDF first.");
            return;
        }
        if (fileToUpload.type !== "application/pdf") {
            setError("Only PDF files are allowed.");
            return;
        }

        const formData = new FormData();
        formData.append("pdf", fileToUpload);

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:${BACK_PORT}/api/parse`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            const parsed = JSON.parse(data.transcript);

            await saveToDB(parsed);
            setFile(null);
        } catch (error) {
            setError(error.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    // Handle file input change
    const handleFileChange = async (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            await handleUpload(selectedFile);
        }
    };

    // Handle re-parse (redirect to dashboard)
    const handleReParse = () => {
        navigate("/dashboard");
    };

    // Fetch transcript on mount
    useEffect(() => {
        fetchTranscript();
    }, [user, token]);

    return (
        <div className={styles.layout}>
            <Sidebar />
            <div className={styles.main}>
                <div>
                    <h1 className={styles.pageTitle}>Transcript</h1>
                    <p className={styles.pageSubtitle}>Upload and manage your academic record</p>
                </div>

                {loading && (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Loading your transcript...</p>
                    </div>
                )}

                {error && (
                    <div style={{
                        background: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        color: '#c00',
                        fontSize: '14px',
                        marginBottom: '16px'
                    }}>
                        {error}
                    </div>
                )}

                {!loading && (
                    <>
                        {/* Hidden file input for upload */}
                        <input
                            type="file"
                            id="transcriptFileInput"
                            accept=".pdf"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />

                        <TranscriptCard
                            transcript={transcript}
                            lastParsed={lastParsed}
                            onUpload={() => document.getElementById('transcriptFileInput').click()}
                            onReParse={handleReParse}
                        />
                    </>
                )}
            </div>
            <Schedule />
        </div>
    );
}