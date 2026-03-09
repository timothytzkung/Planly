
import styles from "./Dashboard.module.css"
import { useEffect } from "react";

// Dashboard view, props will contain data?
export const Dashboard = ({ uploadTranscript, setFile, setTranscript, transcript, summary }) => {

    // Destruct summary if exists
    const { 
        creditsCompleted, creditsInProgress, percentComplete, studentStatus
    } = summary?.summary;

    // Array of courses
    const { timeline } = summary.timeline;

    const courses = [
        { name: "MACM 100", credits: 3, tag: "SIAT", accent: `${styles.siatBlue}` },
        { name: "IAT 206W", credits: 3, tag: "SIAT", accent: `${styles.siatBlue}` },
        { name: "IAT 235", credits: 3, tag: "SIAT", accent: `${styles.siatOrange}` },
        { name: "ARCH 131", credits: 3, tag: "BREADTH", accent: `${styles.breadth}` },
    ];

    const gaps = [
        { label: "Lower Division", done: 12, req: 30, fillClass: "green" },
        { label: "Upper Division", done: 3, req: 60, fillClass: "blue" },
        { label: "Breadth", done: 12, req: 18, fillClass: "yellow" },
    ];

    useEffect(() => {
        console.log("DashCompon Summary: ", summary)
        console.log("DashComp, creds: ", creditsCompleted ?? 0)
    }, [summary])


    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.yearTitle}>{studentStatus}</h1>
                <div className={styles.headerProgress}>
                    <span>{creditsCompleted ?? 0} of 120 credits completed</span>
                    <div className={styles.miniBar}><div className={styles.miniBarFill} /></div>
                </div>
            </div>

            <p className={styles.subtitle}>Fall 2025 | SIAT Major | BSc</p>

            <div className={styles.btnRow}>
                <form onSubmit={uploadTranscript}>
                    <label htmlFor="fileUpload" className={styles.btnOutline}>
                        Upload Transcript
                    </label>
                    <input
                    style={{display: "none"}}
                        type="file"
                        id="fileUpload"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                    <button
                    className={styles.btnPrimary}>Submit & Analyze</button>
                </form>
                <button className={styles.btnPrimary}>Plan Semester →</button>
            </div>

            {/* Degree Completion */}
            <div className={styles.degreeCard}>
                <div className={styles.degreeCardHeader}>
                    <span className={styles.degreeCardTitle}>Degree Completion</span>
                    <a className={styles.viewLink}>View Degree →</a>
                </div>
                <div className={styles.degreeProgressBar}>
                    <div className={styles.degreeProgressFill} />
                </div>
                <div className={styles.degreeStats}>
                    <span>{creditsCompleted ?? 0}  credits completed</span>
                    <span>{120 - (creditsCompleted?? 0) } credits remaining</span>
                </div>
            </div>

            {/* Stats Grid // => Maybe create card component later and pass in style? */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Credits Earned</div>
                    <div className={`${styles.statValue} ${styles.statCredits}`}>{creditsCompleted}<span className={styles.denom}>/120</span></div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Courses Completed</div>
                    <div className={`${styles.statValue} ${styles.statCourses}`}>6<span className={styles.denom}>/40</span></div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Degree Progress</div>
                    <div className={`${styles.statValue} ${styles.statProgress}`}>{percentComplete}%</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Current Semester</div>
                    <div className={styles.termContainer}>
                        <div className={`${styles.statValue} ${styles.statSemester}`}>
                            Fall
                        </div>
                        <span className={styles.statSemesterYear}> 2025</span>
                    </div>


                </div>
            </div>

            {/* Current Semester Courses */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Current Semester Courses</span>
                    <a className={styles.viewLink} style={{ color: "#c8102e" }}>View Planner →</a>
                </div>
                <div className={styles.coursesGrid}>
                    {courses.map((c) => (
                        <div key={c.name} className={`${styles.courseCard} ${c.accent}`}>
                            <div className={styles.courseTop}>
                                <span
                                    className={
                                        `${styles.tag} ${c.tag === "SIAT" ?
                                            styles.tagSiat : styles.tagBreadth
                                        }`}
                                >
                                    {c.tag}
                                </span>
                                <span className={styles.courseCredits}>{c.credits}cr</span>
                            </div>
                            <div className={styles.courseName}>{c.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Requirement Gaps */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Requirement Gaps</span>
                </div>
                <div className={styles.gapGrid}>
                    {/* Renders cards */}
                    {gaps.map((g) => (
                        <div key={g.label} className={styles.gapCard}>
                            <div className={styles.gapLabel}>{g.label}</div>

                            <div className={styles.gapBar}>
                                <div
                                    className={`${styles.gapFill} ${styles[g.fillClass]}`}
                                    style={{ width: `${(g.done / g.req) * 100}%` }}
                                />
                            </div>
                            <div className={styles.gapStats}>
                                <span>{g.done} done</span>
                                <span>{g.req} req.</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}