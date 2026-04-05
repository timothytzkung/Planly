import { useState, useMemo } from 'react';
import styles from './TranscriptCard.module.css';

export const TranscriptCard = ({ 
    transcript, 
    lastParsed = null,
    onUpload, 
    onReParse 
}) => {
    const [activeSemester, setActiveSemester] = useState('All');

    // Calculate statistics from transcript
    const statistics = useMemo(() => {
        if (!transcript || !transcript.transcript) {
            return {
                totalCredits: 0,
                gpa: 0,
                completedCourses: 0,
                inProgressCourses: 0,
                semesters: []
            };
        }

        const gradePoints = {
            'A+': 4.33, 'A': 4.0, 'A-': 3.67,
            'B+': 3.33, 'B': 3.0, 'B-': 2.67,
            'C+': 2.33, 'C': 2.0, 'C-': 1.67,
            'D': 1.0, 'F': 0.0, 'P': 0
        };

        let totalCredits = 0;
        let totalGradePoints = 0;
        let gradedCredits = 0;
        let completedCourses = 0;
        let inProgressCourses = 0;
        const semesters = [];

        transcript.transcript.forEach(termData => {
            const termCourses = termData.courses || [];
            let termCredits = 0;

            termCourses.forEach(course => {
                if (course.status !== 'withdrawn') {
                    const credits = course.credits || 0;
                    totalCredits += credits;
                    termCredits += credits;

                    // Status check
                    if (course.status === 'completed' || course.status === 'pass') {
                        completedCourses++;
                        
                        // Calculate GPA
                        if (course.grade && course.grade !== 'P' && course.grade !== null) {
                            const points = gradePoints[course.grade] || 0;
                            totalGradePoints += points * credits;
                            gradedCredits += credits;
                        }
                    } else if (course.status === 'in progress' || course.status === 'In Progress') {
                        inProgressCourses++;
                    }
                }
            });

            semesters.push({
                term: termData.term,
                courses: termCourses,
                credits: termCredits
            });
        });

        const gpa = gradedCredits > 0 ? (totalGradePoints / gradedCredits).toFixed(2) : 0;

        return {
            totalCredits,
            gpa: parseFloat(gpa),
            completedCourses,
            inProgressCourses,
            semesters
        };
    }, [transcript]);

    // Filter courses by semester
    const filteredCourses = useMemo(() => {
        if (activeSemester === 'All') {
            return statistics.semesters.flatMap(s => 
                (s.courses || []).map(c => ({ ...c, term: s.term }))
            );
        }

        const semester = statistics.semesters.find(s => s.term === activeSemester);
        return semester ? (semester.courses || []).map(c => ({ ...c, term: semester.term })) : [];
    }, [statistics, activeSemester]);

    // Get grade color
    const getGradeColor = (grade) => {
        if (!grade) return '';
        const firstChar = grade.charAt(0).toLowerCase();
        if (['a', 'p'].includes(firstChar)) return 'gradeA';
        if (firstChar === 'b') return 'gradeB';
        if (firstChar === 'c') return 'gradeC';
        if (firstChar === 'd') return 'gradeD';
        if (firstChar === 'f') return 'gradeF';
        return '';
    };

    if (!transcript) {
        return (
            <div className={styles.transcriptCard}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>📄</div>
                    <div className={styles.emptyStateText}>No transcript uploaded</div>
                    <div className={styles.emptyStateSubtext}>Upload your academic transcript to get started</div>
                    <button className={styles.btnUpload} onClick={onUpload}>
                        Upload Transcript
                    </button>
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
                    {lastParsed && (
                        <div className={styles.cardMeta}>
                            Last parsed: {lastParsed}
                        </div>
                    )}
                </div>
                <div className={styles.cardActions}>
                    <button className={styles.btnUpload} onClick={onUpload}>
                        Upload PDF
                    </button>
                    <button className={styles.btnReParse} onClick={onReParse}>
                        Re-parse
                    </button>
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
                    <div className={styles.statLabel}>GPA</div>
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

            {/* Completed Courses Section */}
            <div className={styles.coursesSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>Completed Courses</div>
                    <div className={styles.courseCount}>
                        {filteredCourses.length} courses | {filteredCourses.reduce((sum, c) => sum + (c.credits || 0), 0)} credits
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
                            {semester.term} <span style={{ marginLeft: '4px', fontSize: '12px' }}>({semester.courses.length})</span>
                        </button>
                    ))}
                </div>

                {/* Courses Table */}
                {filteredCourses.length > 0 ? (
                    <table className={styles.coursesTable}>
                        <thead>
                            <tr>
                                <th>Course Code</th>
                                <th>Title</th>
                                <th>Credits</th>
                                <th>Grade</th>
                                <th>Term</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map((course, idx) => (
                                <tr key={`${course.term}-${course.courseNumber}-${idx}`}>
                                    <td className={styles.courseCode}>
                                        {course.faculty} {course.courseNumber}
                                    </td>
                                    <td className={styles.courseTitle}>{course.courseName}</td>
                                    <td>{course.credits}</td>
                                    <td>
                                        <span className={`${styles.gradeChip} ${styles[getGradeColor(course.grade)]}`}>
                                            {course.grade || 'N/A'}
                                        </span>
                                    </td>
                                    <td>{course.term}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>📚</div>
                        <div className={styles.emptyStateText}>No courses in this semester</div>
                    </div>
                )}
            </div>
        </div>
    );
};
