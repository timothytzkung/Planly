
import styles from "./DegreePlanner.module.css"
import { useEffect, useState } from 'react';

const LegendItem = ({ color, label, count, dotStyle = {} }) => {
    return (
        <div className={styles.legendItem}>
            <div
                className={styles.legendItemDot}
                style={{ background: color, ...dotStyle }}
            />
            {label}{" "}
            <span className={styles.legendItemCount}>{count}</span>
        </div>
    );
};

const ProgressBar = ({ percent, color }) => {
    return (
        <div className={styles.progressBar}>
            <div
                className={styles.progressBarFill}
                style={{ width: `${percent}%`, background: color }}
            />
        </div>
    );
};

const OverallProgressCard = ({ creditsDone, completed, inProgress, remaining, total, COLORS }) => {
    // Calculate percentage of credits done
    const pct = Math.round((creditsDone / total) * 100);

    return (
        <div className={`${styles.card} ${styles.cardOverall}`}>
            <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Overall Progress</span>
                <span className={styles.cardCredits}>
                    {creditsDone} / {total} credits
                </span>
            </div>
            <ProgressBar percent={pct} color={COLORS.completed} />
            <div className={styles.legend}>
                <LegendItem
                    color={COLORS.bachelor}
                    label="Completed"
                    count={completed}
                />
                <LegendItem
                    color={COLORS.breadth}
                    label="In Progress"
                    count={inProgress}
                />
                <LegendItem
                    color="#ccc"
                    label="Remaining"
                    count={remaining}
                />
            </div>
        </div>
    );
};

// Chip styling component
const Chip = ({ code, status }) => {
    const cls =
        status === "completed"
            ? `${styles.chip} ${styles.chipCompleted}`
            : status === "in-progress"
                ? `${styles.chip} ${styles.chipInprogress}`
                : `${styles.chip} ${styles.chipRemaining}`;

    return <span className={`${cls}`}>{code}</span>;
};

const SectionCard = ({
    title,
    percent,
    creditsDone,
    creditsTotal,
    courses,
    accentColor,
}) => {
    return (
        <div className={styles.card}>
            <div className={styles.sectionCardTop}>
                <span className={styles.sectionCardTitle}>{title}</span>
                <span
                    className={styles.sectionCardPercent}
                    style={{ color: accentColor }}
                >
                    {percent}%
                </span>
            </div>
            <div className={styles.sectionCardSub}>
                {creditsDone}/{creditsTotal} credits
            </div>
            {courses.length > 0 && (
                <div className={styles.chips}>
                    {courses.map(({ code, status }) => (
                        <Chip key={code} code={code} status={status} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Main degree planner view
export const DegreePlanner = ({ summary }) => {

    const [courses, setCourses] = useState([]);

    // Temporary fallback courses in case fetch failure
    const [LOWER_DIVISION, SET_LOWER_DIVISION] = useState([
        { code: "IAT 100", status: "completed" },
        { code: "IAT 102", status: "completed" },
        { code: "IAT 103W", status: "completed" },
        { code: "IAT 106", status: "completed" },
        { code: "CMPT 120", status: "completed" },
        { code: "IAT 167", status: "completed" },
        { code: "MATH 130", status: "completed" },
        { code: "MACM 101", status: "completed" },
        { code: "IAT 206W", status: "in-progress" },
        { code: "IAT 201", status: "remaining" },
        { code: "IAT 202", status: "remaining" },
        { code: "IAT 222", status: "remaining" },
        { code: "IAT 233", status: "remaining" },
        { code: "IAT 235", status: "remaining" },
        { code: "IAT 238", status: "remaining" },
        { code: "IAT 265", status: "remaining" },
    ]);

    const [UPPER_DIVISION, SET_UPPER_DIVISION] = useState([
        { code: "IAT 333", status: "remaining" },
        { code: "IAT 336", status: "remaining" },
        { code: "IAT 339", status: "remaining" },
        { code: "IAT 351", status: "remaining" },
        { code: "IAT 355", status: "remaining" },
        { code: "IAT 359", status: "remaining" },
        { code: "IAT 360", status: "remaining" },
        { code: "IAT 381", status: "remaining" },
        { code: "IAT 387", status: "remaining" },
        { code: "IAT 410", status: "remaining" },
        { code: "IAT 432", status: "remaining" },
        { code: "IAT 452", status: "remaining" },
        { code: "IAT 459", status: "remaining" },
        { code: "IAT 460", status: "remaining" },
        { code: "IAT 461", status: "remaining" },
        { code: "IAT 481", status: "remaining" },
        { code: "IAT 487", status: "remaining" },
        { code: "IAT 499", status: "remaining" }
    ]);

    const timeline = summary?.timeline;
    const requirements = summary?.requirements;

    const formatCourses = (_timeline) => {
        // null check
        if (!_timeline) return [];

        return Object.values(_timeline).flatMap(term => term.courses || []);
    };

    const updateRequirements = (division, completedCourses) => {
        // look up for courses
        return division.map((reqCourse) => {
            const matchedCourse = completedCourses.find(
                (course) => course.code === reqCourse.code
            );

            return matchedCourse
                ? { ...reqCourse, status: matchedCourse.status }
                : reqCourse;
        });
    };

    useEffect(() => {
        if (!summary || !timeline) return;

        const formattedCourses = formatCourses(timeline);
        setCourses(formattedCourses);
    }, [summary, timeline]);

    useEffect(() => {
        if (!courses.length) return;

        SET_LOWER_DIVISION((prev) => updateRequirements(prev, courses));
        SET_UPPER_DIVISION((prev) => updateRequirements(prev, courses));
    }, [courses]);

    const COLORS = {
        completed: "#E24B4A",
        inProgress: "#185FA5",
        remaining: "transparent",
        lowerDiv: "#E24B4A",
        upperDiv: "#185FA5",
        breadth: "#EF9F27",
        bachelor: "#1D9E75",
    };

    // // Debug for schema visibility
    // console.log(summary)

    return (
        <>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.degreeHeader}>
                    <div className={styles.degreeHeaderLeft}>
                        <h1>Degree</h1>
                        <p>SIAT Major | BSc | 120 credits total</p>
                    </div>
                    <div className={styles.degreeHeaderRight}>
                        <div className={styles.degreeHeaderPercent}>{summary?.summary.percentComplete}%</div>
                        <p className={styles.degreeHeaderLabel}>Degree Completed</p>
                    </div>
                </header>

                {/* Overall */}
                <OverallProgressCard
                creditsDone={summary?.summary.creditsCompleted}
                    completed={summary?.summary.creditsCompleted}
                    inProgress={summary?.summary.creditsInProgress}
                    remaining={summary?.summary.creditsRemaining}
                    total={120}
                    COLORS={COLORS}
                />

                {/* Sections grid 
                it's so ugly oml => refactor into a state later maybe?
                */}
                <div className={styles.sectionGrid}>
                    <SectionCard
                        title="Lower Division"
                        percent={Math.round((requirements?.lowerDivisionRequired?.creditsCompleted + requirements?.lowerDivisionElectives?.creditsCompleted)/39 * 100)}
                        creditsDone={requirements?.lowerDivisionRequired?.creditsCompleted + requirements?.lowerDivisionElectives?.creditsCompleted }
                        creditsTotal={39}
                        courses={LOWER_DIVISION}
                        accentColor={COLORS.lowerDiv}
                    />
                    <SectionCard
                        title="Upper Division (Science)"
                        percent={Math.round((requirements?.upperDivisionScience?.creditsCompleted + requirements?.upperDivisionScience?.creditsInProgress)/24 * 100)}
                        creditsDone={requirements?.upperDivisionScience?.creditsCompleted + requirements?.upperDivisionScience?.creditsInProgress}
                        creditsTotal={24}
                        courses={UPPER_DIVISION}
                        accentColor={COLORS.upperDiv}
                    />
                    <SectionCard
                        title="Breadth Req."
                        percent={
                            Math.floor((requirements?.wqb.breadth.additional.completed +
                            requirements?.wqb.breadth.humanities.completed +
                            requirements?.wqb.breadth.science.completed +
                            requirements?.wqb.breadth.socialScience.completed) /36 * 100)
                        }
                        creditsDone={
                            requirements?.wqb.breadth.additional.completed +
                            requirements?.wqb.breadth.humanities.completed +
                            requirements?.wqb.breadth.science.completed +
                            requirements?.wqb.breadth.socialScience.completed
                        }
                        creditsTotal={36}
                        courses={[]}
                        accentColor={COLORS.breadth}
                    />
                    <SectionCard
                        title="Bachelor Req."
                        percent={Math.round(summary?.summary.creditsCompleted / 120 * 100)}
                        creditsDone={summary?.summary.creditsCompleted}
                        creditsTotal={120}
                        courses={[]}
                        accentColor={COLORS.bachelor}
                    />
                </div>
            </div>
        </>
    )
}