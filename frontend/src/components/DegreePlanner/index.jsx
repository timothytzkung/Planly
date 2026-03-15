
import styles from "./DegreePlanner.module.css"


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

const OverallProgressCard = ({ completed, inProgress, remaining, total, COLORS }) => {
    const credits = completed * 3 + inProgress * 3; // rough approx
    const creditsDone = 19;
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

const Chip = ({ code, status }) => {
    const cls =
        status === "completed"
            ? `${styles.chip} ${styles.chipCompleted}`
            : status === "inprogress"
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


export const DegreePlanner = () => {
    const COLORS = {
        completed: "#E24B4A",
        inProgress: "#185FA5",
        remaining: "transparent",
        lowerDiv: "#E24B4A",
        upperDiv: "#185FA5",
        breadth: "#EF9F27",
        bachelor: "#1D9E75",
      };
      // Temporary data
    const LOWER_DIVISION = [
        { code: "IAT 100", status: "completed" },
        { code: "IAT 102", status: "completed" },
        { code: "IAT 103W", status: "completed" },
        { code: "IAT 106", status: "completed" },
        { code: "CMPT 120", status: "completed" },
        { code: "IAT 167", status: "completed" },
        { code: "MATH 130", status: "completed" },
        { code: "MACM 101", status: "completed" },
        { code: "IAT 206W", status: "inprogress" },
        { code: "IAT 201", status: "remaining" },
        { code: "IAT 202", status: "remaining" },
        { code: "IAT 222", status: "remaining" },
        { code: "IAT 233", status: "remaining" },
        { code: "IAT 235", status: "remaining" },
        { code: "IAT 238", status: "remaining" },
        { code: "IAT 265", status: "remaining" },
      ];
       
      const UPPER_DIVISION = [
        { code: "IAT 339", status: "inprogress" },
        { code: "IAT 359", status: "inprogress" },
        { code: "IAT 459", status: "remaining" },
        { code: "IAT 333", status: "remaining" },
        { code: "IAT 431", status: "remaining" },
        { code: "IAT 438", status: "remaining" },
        { code: "IAT 334", status: "remaining" },
        { code: "IAT 351", status: "remaining" },
        { code: "IAT 432", status: "remaining" },
        { code: "IAT 452", status: "remaining" },
      ];
       
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
                        <div className={styles.degreeHeaderPercent}>16%</div>
                        <p className={styles.degreeHeaderLabel}>Degree Completed</p>
                    </div>
                </header>

                {/* Overall */}
                <OverallProgressCard
                    completed={6}
                    inProgress={4}
                    remaining={30}
                    total={120}
                    COLORS={COLORS}
                />

                {/* Sections grid */}
                <div className={styles.sectionGrid}>
                    <SectionCard
                        title="Lower Division"
                        percent={40}
                        creditsDone={12}
                        creditsTotal={30}
                        courses={LOWER_DIVISION}
                        accentColor={COLORS.lowerDiv}
                    />
                    <SectionCard
                        title="Upper Division"
                        percent={12}
                        creditsDone={7}
                        creditsTotal={44}
                        courses={UPPER_DIVISION}
                        accentColor={COLORS.upperDiv}
                    />
                    <SectionCard
                        title="Breadth Req."
                        percent={0}
                        creditsDone={0}
                        creditsTotal={36}
                        courses={[]}
                        accentColor={COLORS.breadth}
                    />
                    <SectionCard
                        title="Bachelor Req."
                        percent={0}
                        creditsDone={19}
                        creditsTotal={120}
                        courses={[]}
                        accentColor={COLORS.bachelor}
                    />
                </div>
            </div>
        </>
    )
}