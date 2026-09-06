
/**
 * Calculate GPAs with actual grades
 */
export const calculateGPAs = (courses) => {
    const gradePoints = {
        'A+': 4.33, 'A': 4.0, 'A-': 3.67,
        'B+': 3.33, 'B': 3.0, 'B-': 2.67,
        'C+': 2.33, 'C': 2.0, 'C-': 1.67,
        'D': 1.0, 'F': 0.0
    };

    const completedWithGrades = courses.filter(c =>
        (c.status === 'completed' || c.status === 'pass') &&
        c.grade !== 'P' &&
        c.grade !== null
    );

    const majorCourses = completedWithGrades.filter(c => c.faculty === 'IAT');

    // Calculate overall GPA
    const overallGradePoints = completedWithGrades.reduce((sum, c) => {
        const points = gradePoints[c.grade] || 0;
        return sum + (points * c.credits);
    }, 0);

    const overallCredits = completedWithGrades.reduce((sum, c) => sum + c.credits, 0);
    const overallGPA = overallCredits > 0 ? overallGradePoints / overallCredits : 0;

    // Calculate IAT GPA
    const majorGradePoints = majorCourses.reduce((sum, c) => {
        const points = gradePoints[c.grade] || 0;
        return sum + (points * c.credits);
    }, 0);

    const majorCredits = majorCourses.reduce((sum, c) => sum + c.credits, 0);
    const majorGPA = majorCredits > 0 ? majorGradePoints / majorCredits : 0;

    // Calculate term-by-term GPA
    const termGPAs = {};
    const uniqueTerms = [...new Set(courses.map(c => c.term))];

    for (const term of uniqueTerms) {
        const termCourses = completedWithGrades.filter(c => c.term === term);
        const termPoints = termCourses.reduce((sum, c) => {
            const points = gradePoints[c.grade] || 0;
            return sum + (points * c.credits);
        }, 0);
        const termCredits = termCourses.reduce((sum, c) => sum + c.credits, 0);
        termGPAs[term] = termCredits > 0 ? (termPoints / termCredits).toFixed(2) : 'N/A';
    }

    return {
        overall: {
            gpa: parseFloat(overallGPA.toFixed(2)),
            credits: overallCredits,
            courses: completedWithGrades.length,
            meetsMinimum: overallGPA >= 2.0
        },
        major: {
            gpa: parseFloat(majorGPA.toFixed(2)),
            credits: majorCredits,
            courses: majorCourses.length,
            meetsMinimum: majorGPA >= 2.4
        },
        byTerm: termGPAs,
        gradeDistribution: calculateGradeDistribution(completedWithGrades)
    };
};

/**
 * Calculate grade distribution
 */
const calculateGradeDistribution = (courses) => {
    const distribution = {
        'A+': 0, 'A': 0, 'A-': 0,
        'B+': 0, 'B': 0, 'B-': 0,
        'C+': 0, 'C': 0, 'C-': 0,
        'D': 0, 'F': 0
    };

    courses.forEach(c => {
        if (distribution.hasOwnProperty(c.grade)) {
            distribution[c.grade]++;
        }
    });

    return distribution;
};
