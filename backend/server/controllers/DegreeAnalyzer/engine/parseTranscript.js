export const parseTranscriptData = (transcriptData) => {
    const courses = [];

    for (const [term, termCourses] of Object.entries(transcriptData)) {
        for (const course of termCourses) {
            if (course.status === 'withdrawn') continue;

            const courseCode = `${course.faculty} ${course['courseNumber']}`;
            const courseLevel = Math.floor(parseInt(course['courseNumber']) / 100) * 100;

            courses.push({
                courseCode,
                courseName: course['courseName'],
                faculty: course.faculty,
                courseNumber: course['courseNumber'],
                credits: course.credits,
                grade: course.grade,
                courseLevel,
                term,
                status: course.status,
                classAverage: course['classAverage'],
                classSize: course['classSize']
            });
        }
    }

    return courses;
};
