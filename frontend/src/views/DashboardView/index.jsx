

import { Dashboard } from "../../components/Dashboard";
import { Sidebar } from "../../components/Sidebar";

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import styles from "./DashboardView.module.css"

export const DashboardView = () => {

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

    const saveToDB = async (e) => {
        e.preventDefault();
        if (transcript) {
            try {
                const res = await fetch(`http://localhost:${BACK_PORT}/api/transcript/upload`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                    body: JSON.stringify({ data: transcript })
                })
                if (res.ok) {
                    const result = await res.json();
                    alert("Your Transcript has been saved!")
                    console.log(result);
                } else {
                    const errData = await res.json();
                    alert(errData || "Failed to add transcript");
                }
            } catch (e) {
                console.log("Submission error: ", e);
            }
        } else {
            alert("Please upload a transcript first!")
        }
    }

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
                degreeType: _degreeType
            })
        }).catch((error) => setErr(error));

        const data = await response.json();
        const parsed = JSON.parse(data.result)
        return parsed;
    }

    // Trigger on finished pdf upload
    useEffect(() => {

        if (transcript) {
            const count = countTotalCredits(transcript);
            setCredits(count);
        }

        const handleRequirements = async () => {
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

    return(
        <div className={styles.layout}>
            <Sidebar />
            <Dashboard />
        </div>

    )
}