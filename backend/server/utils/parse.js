
export const parseTranscript = (transcriptText) => {
  const lines = transcriptText.split("\n");

  const courseRegex = /^([A-Z]{3,4})\s+(\d{2,3}[A-Z]?)\s+(.+?)\s+(\d+\.\d{2})\s+(\d+\.\d{2})\s+([A-Z][+-]?)\s+([\d.]+)\s+([A-Z][+-]?)\s+(\d+)$/;

  const courses = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(courseRegex);

    if (!match) continue;

    const [
      _,
      faculty,
      courseNumber,
      courseName,
      credits,
      _completedCredits,
      grade,
      _gradePoints,
      classAverage,
      classSize
    ] = match;

    // Skip non-graded or in-progress courses
    if (grade === "-" || grade === "WD") continue;

    courses.push({
      "course-name": courseName,
      "faculty": faculty,
      "course-number": courseNumber,
      "credits": parseFloat(credits),
      // "grade": grade,
      "class-average": classAverage,
      "class-size": parseInt(classSize, 10)
    });
  }

  return courses;
}
  