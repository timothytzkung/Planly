import styles from "./TranscriptView.module.css";

import { useEffect, useState, useContext } from 'react';

import { Sidebar } from "../../components/Sidebar";
import { Schedule } from "../../components/Schedule";
import { TranscriptCard } from "../../components/TranscriptCard/TranscriptCard";
import { AuthContext } from "../../context/AuthContext";

export const TranscriptView = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { backport, user } = useContext(AuthContext);

    // Fetch summaries
    const fetchSummary = async() => {
        try {
            const res = await fetch(`http://localhost:${backport}/api/summary/`, {
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

    // Summary fetching
    useEffect(() => {
        const handleFetchSummary = async() => {
            const result = await fetchSummary();
            setSummary(result);
            setLoading(false);
        }
        if (!summary && user) {
            handleFetchSummary();
        }

    }, [user, backport])

    return(
        <div className={styles.layout}>
            <Sidebar />
            <div className={styles.main}>
                <div>
                    <h1 className={styles.pageTitle}>Transcript</h1>
                    <p className={styles.pageSubtitle}>View your academic progress and course history</p>
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

                {!loading && summary && (
                    <TranscriptCard summary={summary} />
                )}

                {!loading && !summary && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>📄</div>
                        <div className={styles.emptyStateText}>No transcript data available</div>
                        <div className={styles.emptyStateSubtext}>Upload your transcript in the dashboard to get started</div>
                    </div>
                )}
            </div>
        </div>
    )
}