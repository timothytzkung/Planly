
import styles from "./Dashboard.module.css"

// Dashboard view, props will contain data?
export const Dashboard = (props) => {

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


    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.yearTitle}>Year 2</h1>
                <div className={styles.headerProgress}>
                    <span>19 of 120 credits completed</span>
                    <div className={styles.miniBar}><div className={styles.miniBarFill} /></div>
                </div>
            </div>

            <p className={styles.subtitle}>Fall 2025 | SIAT Major | BSc</p>

            <div className={styles.btnRow}>
                <button className={styles.btnOutline}>Upload Transcript</button>
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
                    <span>19 credits completed</span>
                    <span>101 credits remaining</span>
                </div>
            </div>

            {/* Stats Grid // => Maybe create card component later and pass in style? */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Credits Earned</div>
                    <div className={`${styles.statValue} ${styles.statCredits}`}>19<span className={styles.denom}>/120</span></div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Courses Completed</div>
                    <div className={`${styles.statValue} ${styles.statCourses}`}>6<span className={styles.denom}>/40</span></div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Degree Progress</div>
                    <div className={`${styles.statValue} ${styles.statProgress}`}>16%</div>
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