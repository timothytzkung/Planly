
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
    progressDone,
    progressTotal,
    progressUnit,
    accentColor,
    courses = [],
    courseOptions = [],
    childrenRequirements = [],
}) => {
    const completedCodes = new Set(
        courses
            .filter(c => c.status === "completed" || c.completed)
            .map(c => c.code ?? c.course)
    );

    const inProgressCodes = new Set(
        courses
            .filter(c => c.status === "in-progress" || c.inProgress)
            .map(c => c.code ?? c.course)
    );

    const STATUS_ORDER = { completed: 0, "in-progress": 1, remaining: 2 };

    const chipCourses = (
        courseOptions.length > 0
            ? courseOptions.map(code => ({
                  code,
                  status: completedCodes.has(code)
                      ? "completed"
                      : inProgressCodes.has(code)
                      ? "in-progress"
                      : "remaining",
              }))
            : courses.map(c => ({
                  code: c.code ?? c.course,
                  status:
                      c.status === "completed" || c.completed
                          ? "completed"
                          : c.status === "in-progress" || c.inProgress
                          ? "in-progress"
                          : "remaining",
              }))
    ).sort((a, b) => (STATUS_ORDER[a.status] ?? 2) - (STATUS_ORDER[b.status] ?? 2));

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
                {progressDone}/{progressTotal} {progressUnit}
            </div>

            {childrenRequirements.length > 0 && (
                <div className={styles.childRequirements}>
                    {childrenRequirements.map((child) => {
                        const childProgress = getRequirementProgress(child);
                        return (
                            <div key={child.id} className={styles.childRequirementRow}>
                                <span style={{ fontWeight: "700" }}>{child.name}: </span>
                                <span>
                                    {childProgress.done}/{childProgress.total}{" "}
                                    {childProgress.unit}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {chipCourses.length > 0 && (
                <div className={styles.chips}>
                    {chipCourses.map(({ code, status }) => (
                        <Chip key={code} code={code} status={status} />
                    ))}
                </div>
            )}
        </div>
    );
};

const getRequirementProgress = (req) => {
    if (!req) {
        return { percent: 0, done: 0, total: 0, unit: "requirements" };
    }

    if (req.progressUnit === "credits") {
        const done = (req.creditsCompleted ?? 0) + (req.creditsInProgress ?? 0);
        const total = req.creditsRequired ?? 0;

        return {
            percent: total > 0 ? Math.round((done / total) * 100) : 0,
            done,
            total,
            unit: "credits"
        };
    }

    if (req.progressUnit === "courses") {
        const done = (req.completed ?? 0) + (req.inProgress ?? 0);
        const total = req.required ?? 0;

        return {
            percent: total > 0 ? Math.round((done / total) * 100) : 0,
            done,
            total,
            unit: "courses"
        };
    }

    return {
        percent: req.isMet ? 100 : 0,
        done: req.isMet ? 1 : 0,
        total: 1,
        unit: "requirement"
    };
};


const getRequirementCoursesOptions = (req) => {
    if (!req) return [];

    if (req.options?.length) {
        return req.options;
    }
}

const getRequirementCourses = (req) => {
    if (!req) return [];

    if (req.courses?.length) {
        return req.courses.map(course => ({
            code: course.code ?? course.course ?? course.courseCode,
            name: course.name ?? course.courseName,
            credits: course.credits,
            grade: course.grade,
            status: course.status ?? "remaining"
        }));
    }

    if (req.status?.length) {
        return req.status.map(course => ({
            code: course.course,
            status: course.completed
                ? "completed"
                : course.inProgress
                    ? "in-progress"
                    : "remaining",
            grade: course.grade
        }));
    }

    return [];
};

// Main degree planner view
export const DegreePlanner = ({ summary }) => {
    console.log(summary)
    const requirements = summary?.requirements ?? {};
    const degreeSummary = summary?.summary ?? {};
    const degreeTotalCredits = summary?.degree?.totalCredits ?? 120;

    const COLORS = {
        completed: "#E24B4A",
        inProgress: "#185FA5",
        remaining: "transparent",
        lowerDiv: "#E24B4A",
        upperDiv: "#185FA5",
        breadth: "#EF9F27",
        bachelor: "#1D9E75",
    };

    // Constructs the sections for cards
    const buildSectionConfigs = (requirements, COLORS) => {
        return Object.values(requirements)
            .filter(req => req.showInPlanner !== false)
            .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999))
            .map(req => ({
                title: req.name,
                requirementId: req.id,
                accentColor: COLORS[req.accent] ?? COLORS.upperDiv
            }));
    };

    const sectionConfigs = buildSectionConfigs(requirements, COLORS);

    return (
        <div className={styles.container}>
            <header className={styles.degreeHeader}>
                <div className={styles.degreeHeaderLeft}>
                    <h1>Degree</h1>
                    <p>{summary?.degree?.name ?? "Degree Planner"}</p>
                </div>

                <div className={styles.degreeHeaderRight}>
                    <div className={styles.degreeHeaderPercent}>
                        {degreeSummary.percentComplete ?? 0}%
                    </div>
                    <p className={styles.degreeHeaderLabel}>Degree Completed</p>
                </div>
            </header>

            <OverallProgressCard
                creditsDone={degreeSummary.creditsCompleted ?? 0}
                completed={degreeSummary.creditsCompleted ?? 0}
                inProgress={degreeSummary.creditsInProgress ?? 0}
                remaining={degreeSummary.creditsRemaining ?? 0}
                total={degreeTotalCredits}
                COLORS={COLORS}
            />

            <div className={styles.sectionGrid}>
                {sectionConfigs.map(config => {
                    const req = requirements[config.requirementId];
                    const progress = getRequirementProgress(req);

                    return (
                        <SectionCard
                        key={config.requirementId}
                        title={config.title}
                        percent={progress.percent}
                        progressDone={progress.done}
                        progressTotal={progress.total}
                        progressUnit={progress.unit}
                        courses={getRequirementCourses(req)}
                        courseOptions={req.options ?? []}
                        childrenRequirements={req.children ?? []}
                        accentColor={config.accentColor}
                        />
                    );
                    })}

                {/* <SectionCard
                    title="Bachelor Req."
                    percent={degreeSummary.percentComplete ?? 0}
                    creditsDone={degreeSummary.creditsCompleted ?? 0}
                    creditsTotal={degreeTotalCredits}
                    courses={[]}
                    accentColor={COLORS.bachelor}
                /> */}
            </div>
        </div>
    );
};