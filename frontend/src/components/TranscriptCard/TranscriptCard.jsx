import { useState, useMemo } from 'react';
import styles from './TranscriptCard.module.css';

const GRADE_POINTS = {
    'A+': 4.33, 'A': 4.0, 'A-': 3.67,
    'B+': 3.33, 'B': 3.0, 'B-': 2.67,
    'C+': 2.33, 'C': 2.0, 'C-': 1.67,
    'D': 1.0, 'F': 0.0
};

// Cleaner for timeline
const parseTimelineEntries = (timeline) => {
    if (!timeline) return [];
    if (timeline instanceof Map) {
        return Array.from(timeline.entries());
    }
    return Object.entries(timeline);
};

// Calculates GPA
const computeSemesterGPA = (grades) => {
    if (!grades || grades.length === 0) return 0;
    const points = grades
        .map((grade) => GRADE_POINTS[grade])
        .filter((value) => typeof value === 'number');
    if (points.length === 0) return 0;
    return points.reduce((sum, value) => sum + value, 0) / points.length;
};

// Sort semester terms
const sortSemesterTerms = (terms) => {
    const seasonOrder = { Winter: 0, Spring: 1, Summer: 2, Fall: 3 };
    return terms.sort((a, b) => {
        const [yearA, seasonA] = a.term.split(' ');
        const [yearB, seasonB] = b.term.split(' ');
        if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
        return (seasonOrder[seasonA] ?? 4) - (seasonOrder[seasonB] ?? 4);
    });
};


// Transcript card component for transcript view
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

        // Summary
        const gpaData = summary.gpa;
        const summaryData = summary.summary;
        const timelineEntries = parseTimelineEntries(summary.timeline);

        const semesters = timelineEntries.map(([term, termData]) => {
            const courseList = termData?.courses || [];
            const gpa = computeSemesterGPA(termData?.averageGrade || courseList.map(c => c.grade));
            return {
                term,
                courses: courseList,
                credits: termData?.totalCredits || 0,
                completedCredits: termData?.completedCredits || 0,
                gpa,
                coursesCount: courseList.length
            };
        });

        return {
            totalCredits: summaryData?.creditsCompleted || gpaData.overall?.credits || 0,
            gpa: gpaData.overall?.gpa || 0,
            completedCourses: gpaData.overall?.courses || 0,
            inProgressCourses: summaryData?.creditsInProgress || 0,
            semesters: sortSemesterTerms(semesters)
        };
    }, [summary]);

    // Filter courses
    const filteredCourses = useMemo(() => {
        if (activeSemester === 'All') {
            return statistics.semesters.flatMap((semester) =>
                semester.courses.map((course) => ({ ...course, term: semester.term }))
            );
        }
        const semester = statistics.semesters.find((s) => s.term === activeSemester);
        return semester ? semester.courses.map((course) => ({ ...course, term: semester.term })) : [];
    }, [activeSemester, statistics]);

    const selectedSemester = useMemo(() => {
        if (activeSemester === 'All') return null;
        return statistics.semesters.find((s) => s.term === activeSemester) || null;
    }, [activeSemester, statistics]);

    // Get grade color
    const getGradeColor = (grade) => {
        if (!grade) return '';
        const firstChar = grade.charAt(0).toLowerCase();
        if (['a'].includes(firstChar)) return 'gradeA';
        if (firstChar === 'b') return 'gradeB';
        if (firstChar === 'c') return 'gradeC';
        if (firstChar === 'd') return 'gradeD';
        if (firstChar === 'f') return 'gradeF';
        return '';
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

                {(activeSemester === 'All' || selectedSemester) ? (
                    <>
                        {selectedSemester && (
                            <div className={styles.sectionHeader} style={{ marginTop: '16px' }}>
                                <div className={styles.sectionTitle}>{selectedSemester.term} Summary</div>
                                <div className={styles.courseCount}>
                                    {selectedSemester.coursesCount} courses | {selectedSemester.credits} credits | GPA {selectedSemester.gpa.toFixed(2)}
                                </div>
                            </div>
                        )}

                        <table className={styles.coursesTable}>
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Title</th>
                                    <th>Credits</th>
                                    <th>Grade</th>
                                    <th>Status</th>
                                    <th>Term</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.map((course, idx) => (
                                    <tr key={`${course.term}-${course.code || course.faculty}-${idx}`}>
                                        <td className={styles.courseCode}>{course.code || `${course.faculty} ${course.courseNumber}`}</td>
                                        <td className={styles.courseTitle}>{course.name || course.courseName}</td>
                                        <td>{course.credits}</td>
                                        <td>
                                            <span className={`${styles.gradeChip} ${styles[getGradeColor(course.grade)]}`}>
                                                {course.grade || 'N/A'}
                                            </span>
                                        </td>
                                        <td>{course.status}</td>
                                        <td>{course.term}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
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