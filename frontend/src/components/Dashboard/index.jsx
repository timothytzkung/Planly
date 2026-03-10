
import styles from "./Dashboard.module.css"
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

// Dashboard view, props will contain data?
export const Dashboard = ({ uploadTranscript, setFile, setTranscript, transcript, summary }) => {
    // current courses stash
    const [currentTerm, setCurrentTerm] = useState("");
    const [currentCourses, setCurrentCourses] = useState(null);
    const [lowerDivision, setLowerDivision] = useState(0);
    const [upperDivision, setUpperDivision] = useState(0);
    const [totalBreadth, setTotalBreadth] = useState(0);
    const [gpa, setGpa] = useState(0);
    const [gaps, setGaps] = useState([]);
    
    // Destruct summary if exists
    const { 
        creditsCompleted, creditsInProgress, percentComplete, studentStatus
    } = summary?.summary || 0;

    // Array of courses
    const { timeline } = summary?.timeline || 0;

      // Destructure to use contexts
    const { token, user, logout } = useContext(AuthContext);


    // const gaps = [
    //     { label: "Lower Division", done: 12, req: 30, fillClass: "green" },
    //     { label: "Upper Division", done: 3, req: 60, fillClass: "blue" },
    //     { label: "Breadth", done: 12, req: 18, fillClass: "yellow" },
    // ];

    // Helper func 
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

    const fetchGaps = () => {
        // Currently fetching for sci
        const { 
            lowerDivisionElectives, lowerDivisionRequired, upperDivisionRequired,
            upperDivisionScience, wqb
        } = summary?.requirements || {}

        const {breadth, quantitative, writing} = wqb;
        const {additional, humanities, science, socialScience} = breadth;

        let _breadth = additional?.completed + humanities?.completed + science?.completed + socialScience?.completed;
        let _quant = quantitative?.completed;
        let _writing = writing?.completed;

        // Breadth
        setTotalBreadth(_breadth + _quant + _writing);

        // Core courses
        const totalLowerCompleted = lowerDivisionElectives?.creditsCompleted + lowerDivisionRequired?.creditsCompleted;
        const totalUpperCompleted = upperDivisionRequired?.creditsCompleted + upperDivisionScience?.creditsCompleted;

        setLowerDivision(totalLowerCompleted);
        setUpperDivision(totalUpperCompleted);

    }

    // Terms
    const fetchLatestTerm = () => {
        const _terms = summary?.timeline || {}

        // Null check
        if (!_terms) return {"2025 Fall": {}}; // dummy fallback

        // Returns last key in courses (will always be sorted)
        return Object.keys(_terms)[Object.keys(_terms).length - 1];
    }

    const fetchLatestCourses = () => {
        // Get courses from latest term
        const _courses = summary?.timeline[currentTerm] || {};
        
        // Null check
        if (!_courses) return {}

        return _courses.courses; // returns array of courses
    }

    const fetchGPA = () => {
        const _gpa = summary?.gpa.overall.gpa;
        if(!_gpa) return 0;

        return _gpa;
    }

    useEffect(() => {
        // Get current term
        if (summary) {
            let res = fetchLatestTerm();
            setCurrentTerm(res);
            console.log("Current term is: ", currentTerm);

            // Fetch gaps
            fetchGaps()
            setGaps(
                [
                { label: "Lower Division", done: lowerDivision || 0, req: 30, fillClass: "green" },
                { label: "Upper Division", done: upperDivision || 0, req: 44, fillClass: "blue" },
                { label: "Breadth", done: totalBreadth, req: 18, fillClass: "yellow" },
                ]
            )
            let _gpa = fetchGPA();
            setGpa(_gpa);
        }
        if (currentTerm && summary) {
            let res = fetchLatestCourses();
            setCurrentCourses(res);
        }
        
    }, [summary, currentTerm])


    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.yearTitle}>{studentStatus || "Year 1"}</h1>
                <div className={styles.headerProgress}>
                    <span>{creditsCompleted || 0} of 120 credits completed</span>
                    <div className={styles.miniBar}>
                        <div 
                        className={styles.miniBarFill} 
                        style={{
                            width: `${clamp(creditsCompleted/120 * 100, 0, 100)}%`
                        }}
                        />
                    </div>
                </div>
            </div>

            <p className={styles.subtitle}>{currentTerm || "2025 Fall"} | SIAT Major | BSc</p>

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
                    <div className={styles.degreeProgressFill} 
                    style={{
                            width: `${clamp(creditsCompleted/120 * 100, 0, 100)}%`
                        }}/>
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
                    <div className={`${styles.statValue} ${styles.statCredits}`}>{creditsCompleted ?? 0}<span className={styles.denom}>/120</span></div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>CGPA</div>
                    <div className={`${styles.statValue} ${styles.statCourses}`}>{gpa ?? 0}<span className={styles.denom}>/4.33</span></div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Degree Progress</div>
                    <div className={`${styles.statValue} ${styles.statProgress}`}>{percentComplete ?? 0}%</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Current Semester</div>
                    <div className={styles.termContainer}>
                        <div className={`${styles.statValue} ${styles.statSemester}`}>
                        { currentTerm ?
                        (currentTerm.split(" ")[1] || "N/D") : "N/D"
                        }
                        </div>
                        <span className={styles.statSemesterYear}>
                            { currentTerm ?
                        (currentTerm.split(" ")[0] || "") : ""
                        }</span>
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
                    {currentCourses?.map((c) => (
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
                            <div className={styles.courseName}>{c.code}</div>
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