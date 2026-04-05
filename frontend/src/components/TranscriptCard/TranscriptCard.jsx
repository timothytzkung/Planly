import { useState, useMemo } from 'react';
import styles from './TranscriptCard.module.css';

export const TranscriptCard = ({ summary }) => {
    const [activeSemester, setActiveSemester] = useState('All');

    // Extract data from summary structure
    const statistics = useMemo(() => {
        if (!summary || !summary.gpa) {
            return {
                totalCredits: 0,
                gpa: 0,
                completedCourses: 0,
                inProgressCourses: 0,
                semesters: []
            };
        }

        const gpaData = summary.gpa;
        const summaryData = summary.summary;

        // Get semester data from byTerm (Map structure)
        const semesters = [];
        if (gpaData.byTerm) {
            // Convert Map to array of semester objects
            for (const [term, termData] of Object.entries(gpaData.byTerm)) {
                // Parse term data (format: "gpa:credits:courses")
                const [gpa, credits, courses] = termData.split(':').map(val => parseFloat(val) || 0);
                semesters.push({
                    term,
                    gpa,
                    credits,
                    courses: parseInt(courses) || 0
                });
            }
        }

        return {
            totalCredits: summaryData?.creditsCompleted || gpaData.overall?.credits || 0,
            gpa: gpaData.overall?.gpa || 0,
            completedCourses: gpaData.overall?.courses || 0,
            inProgressCourses: summaryData?.creditsInProgress || 0,
            semesters: semesters.sort((a, b) => a.term.localeCompare(b.term)) // Sort by term
        };
    }, [summary]);

    // Get grade color (simplified since we don't have individual grades)
    const getGradeColor = (gpa) => {
        if (gpa >= 3.7) return 'gradeA';
        if (gpa >= 3.0) return 'gradeB';
        if (gpa >= 2.0) return 'gradeC';
        if (gpa >= 1.0) return 'gradeD';
        return 'gradeF';
    };

    if (!summary) {
        return (
            <div className={styles.transcriptCard}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>📄</div>
                    <div className={styles.emptyStateText}>No transcript data available</div>
                    <div className={styles.emptyStateSubtext}>Upload your transcript in the dashboard to get started</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.transcriptCard}>
            {/* Card Header */}
            <div className={styles.cardHeader}>
                <div>
                    <div className={styles.cardTitle}>Academic Transcript</div>
                    <div className={styles.cardMeta}>
                        {summary.summary?.studentStatus || 'Student Status'}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Credits</div>
                    <div className={`${styles.statValue} ${styles.credits}`}>
                        {statistics.totalCredits}
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Overall GPA</div>
                    <div className={`${styles.statValue} ${styles.gpa}`}>
                        {statistics.gpa.toFixed(2)}
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Courses</div>
                    <div className={`${styles.statValue} ${styles.courses}`}>
                        {statistics.completedCourses}
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>In Progress</div>
                    <div className={`${styles.statValue} ${styles.inProgress}`}>
                        {statistics.inProgressCourses}
                    </div>
                </div>
            </div>

            {/* Semester Breakdown Section */}
            <div className={styles.coursesSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>Semester Breakdown</div>
                    <div className={styles.courseCount}>
                        {statistics.semesters.length} semesters | {statistics.semesters.reduce((sum, s) => sum + s.credits, 0)} credits
                    </div>
                </div>

                {/* Semester Tabs */}
                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tab} ${activeSemester === 'All' ? styles.active : ''}`}
                        onClick={() => setActiveSemester('All')}
                    >
                        All <span style={{ marginLeft: '4px', fontSize: '12px' }}>({statistics.semesters.length})</span>
                    </button>
                    {statistics.semesters.map(semester => (
                        <button
                            key={semester.term}
                            className={`${styles.tab} ${activeSemester === semester.term ? styles.active : ''}`}
                            onClick={() => setActiveSemester(semester.term)}
                        >
                            {semester.term}
                        </button>
                    ))}
                </div>

                {/* Semester Table */}
                {statistics.semesters.length > 0 ? (
                    <table className={styles.coursesTable}>
                        <thead>
                            <tr>
                                <th>Semester</th>
                                <th>GPA</th>
                                <th>Credits</th>
                                <th>Courses</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(activeSemester === 'All' ? statistics.semesters : statistics.semesters.filter(s => s.term === activeSemester)).map((semester) => (
                                <tr key={semester.term}>
                                    <td className={styles.courseCode}>{semester.term}</td>
                                    <td>
                                        <span className={`${styles.gradeChip} ${styles[getGradeColor(semester.gpa)]}`}>
                                            {semester.gpa.toFixed(2)}
                                        </span>
                                    </td>
                                    <td>{semester.credits}</td>
                                    <td>{semester.courses}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>📚</div>
                        <div className={styles.emptyStateText}>No semester data available</div>
                    </div>
                )}
            </div>
        </div>
    );
};