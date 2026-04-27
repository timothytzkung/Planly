/**
 * Generate timeline
 */
export const generateTimeline = (courses) => {
    const terms = {};

    for (const course of courses) {
        if (!terms[course.term]) {
            terms[course.term] = {
                courses: [],
                totalCredits: 0,
                completedCredits: 0,
                averageGrade: []
            };
        }

        terms[course.term].courses.push({
            code: course.courseCode,
            name: course.courseName,
            credits: course.credits,
            grade: course.grade,
            status: course.status
        });

        terms[course.term].totalCredits += course.credits;

        if (course.status === 'completed') {
            terms[course.term].completedCredits += course.credits;
            if (course.grade && course.grade !== 'P') {
                terms[course.term].averageGrade.push(course.grade);
            }
        }
    }

    return terms;
};