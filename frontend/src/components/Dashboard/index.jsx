
import styles from "./Dashboard.module.css"
import { useEffect, useState, useContext, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import { UserContext } from "../../context/UserContext";

// Dashboard view, props will contain data?
export const Dashboard = ({ uploadTranscript, setFile, file, setTranscript, transcript, summary, _error }) => {
    // current courses stash
    const [currentTerm, setCurrentTerm] = useState("");
    // const [currentCourses, setCurrentCourses] = useState(null);
    const [lowerDivision, setLowerDivision] = useState(0);
    const [upperDivision, setUpperDivision] = useState(0);
    const [totalBreadth, setTotalBreadth] = useState(0);
    const [gpa, setGpa] = useState(0);
    // const [gaps, setGaps] = useState([]);

    // Destruct summary if exists
    const {
        creditsCompleted, creditsInProgress, percentComplete, studentStatus
    } = summary?.summary || 0;

    // Array of courses
    const { timeline } = summary?.timeline || 0;

    // Destructure to use contexts
    const { currentCourses, setCurrentCourses } = useContext(AuthContext);

    // Helper func 
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

    const getRequirementByGroup = (requirements, group) => {
        return Object.values(requirements).filter(req => {
            if (req.group === group) return true;

            if (group === "lowerDivision") {
                return req.id?.includes("lower-division");
            }

            if (group === "upperDivision") {
                return req.id?.includes("upper-division") || req.id?.includes("four-hundred");
            }

            return false;
        });
    };

    // Terms
    const fetchLatestTerm = () => {
        const _terms = summary?.timeline || {}

        // Null check
        if (!_terms) return { "2025 Fall": {} }; // dummy fallback

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
        if (!_gpa) return 0;

        return _gpa;
    }

    const getCreditsDone = (req) => {
        return req?.creditsCompleted ?? req?.completed ?? 0;
    };

    const getCreditsRequired = (req) => {
        return req?.creditsRequired ?? req?.creditsTotal ?? req?.required ?? 0;
    };

    const sumRequirementCredits = (reqs) => {
        return reqs.reduce((sum, req) => sum + getCreditsDone(req), 0);
    };

    const sumRequiredCredits = (reqs) => {
        return reqs.reduce((sum, req) => sum + getCreditsRequired(req), 0);
    };

    const buildGaps = (summary) => {
        const requirements = summary?.requirements ?? {};

        const lowerDivisionReqs = getRequirementByGroup(requirements, "lowerDivision");
        const upperDivisionReqs = getRequirementByGroup(requirements, "upperDivision");

        const wqbChildren = requirements["wqb"]?.children ?? [];

        return [
            {
                label: "Lower Division",
                done: sumRequirementCredits(lowerDivisionReqs),
                req: sumRequiredCredits(lowerDivisionReqs),
                fillClass: "green"
            },
            {
                label: "Upper Division",
                done: sumRequirementCredits(upperDivisionReqs),
                req: sumRequiredCredits(upperDivisionReqs),
                fillClass: "blue"
            },
            {
                label: "WQB",
                done: sumRequirementCredits(wqbChildren),
                req: sumRequiredCredits(wqbChildren),
                fillClass: "yellow"
            }
        ];
    };

    // Gap fetching from summary
    const gaps = useMemo(() => {
        if (!summary) return [];
        return buildGaps(summary);
    }, [summary]);





    useEffect(() => {
        if (!summary) return;

        setCurrentTerm(fetchLatestTerm());
        setGpa(fetchGPA());
    }, [summary]);

    useEffect(() => {
        if (!currentTerm || !summary) return;

        setCurrentCourses(fetchLatestCourses());
    }, [currentTerm, summary]);

    console.log(summary)


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
                                width: `${clamp(creditsCompleted / 120 * 100, 0, 100)}%`
                            }}
                        />
                    </div>
                </div>
            </div>

            <p className={styles.subtitle}>{currentTerm || "2025 Fall"} | {summary?.degree.name}</p>
            {file &&
                <div className={styles.fileTextContainer}>File Uploaded: {file.name}</div>
            }
            {_error &&
                <div>{_error}</div>
            }
            <div className={styles.btnRow}>

                <form onSubmit={uploadTranscript} className={styles.inBtnRow}>
                    <label htmlFor="fileUpload" className={styles.btnOutline}>
                        Upload Transcript
                    </label>
                    <input
                        style={{ display: "none" }}
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
                            width: `${clamp(creditsCompleted / 120 * 100, 0, 100)}%`
                        }} />
                </div>
                <div className={styles.degreeStats}>
                    <span>{creditsCompleted ?? 0}  credits completed</span>
                    <span>{120 - (creditsCompleted ?? 0)} credits remaining</span>
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
                            {currentTerm ?
                                (currentTerm.split(" ")[1] || "N/D") : "N/D"
                            }
                        </div>
                        <span className={styles.statSemesterYear}>
                            {currentTerm ?
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

            {/* Requirement Gaps - NOTE: Does NOT include in-progress courses*/}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Requirement Gaps</span>
                </div>

                <div className={styles.gapGrid}>
                    {gaps.map((g) => {
                        const percent = g.req > 0 ? Math.min(100, (g.done / g.req) * 100) : 0;

                        return (
                            <div key={g.label} className={styles.gapCard}>
                                <div className={styles.gapLabel}>{g.label}</div>

                                <div className={styles.gapBar}>
                                    <div
                                        className={`${styles.gapFill} ${styles[g.fillClass]}`}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>

                                <div className={styles.gapStats}>
                                    <span>{g.done} done</span>
                                    <span>{g.req} req.</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}