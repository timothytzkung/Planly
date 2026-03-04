// Token reading L->R
function isUnits(s) {
  return /^\d+\.\d{2}$/.test(s);
}
function isGrade(s) {
  return /^(A\+|A-|A|B\+|B-|B|C\+|C-|C|D|F|WD|WE|P|-)$/.test(s);
}
function isFaculty(s) {
  return /^[A-Z]{3,4}$/.test(s);
}
function isCourseNum(s) {
  return /^\d{2,3}[A-Z]?$/.test(s);
}
function isInt(s) {
  return /^\d+$/.test(s);
}
function isTermLine(line) {
  return /^\d{4}\s+(Spring|Summer|Fall)$/.test(line);
}

// Parsing by term
export const parseTranscriptByTerm = (text) => {
  const lines = text.split("\n");
  const result = {};

  let currentTerm = null;

  for (let raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Detect term headers like "2025 Fall"
    if (isTermLine(line)) {
      currentTerm = line;
      if (!result[currentTerm]) result[currentTerm] = [];
      continue;
    }

    // Must start with FACULTY COURSE#
    const start = line.split(/\s+/);
    if (!currentTerm) continue;
    if (!isFaculty(start[0]) || !isCourseNum(start[1])) continue;

    const tokens = line.split(/\s+/);

    // Enrollment (last token)
    if (!isInt(tokens[tokens.length - 1])) continue;
    const classSize = parseInt(tokens.pop(), 10);

    // Class average or "-"
    const classAvgToken = tokens.pop();
    const classAverage = classAvgToken === "-" ? null : classAvgToken;

    // Grade points
    if (!isUnits(tokens[tokens.length - 1])) continue;
    tokens.pop(); // grade points (unused)

    // Grade (optional)
    let grade = null;
    if (isGrade(tokens[tokens.length - 1]) && !isUnits(tokens[tokens.length - 1])) {
      const g = tokens.pop();
      if (g !== "-") grade = g;
    }

    // Units attempted / completed
    if (tokens.length < 2) continue;
    const completed = tokens.pop();
    const attempted = tokens.pop();
    if (!isUnits(completed) || !isUnits(attempted)) continue;

    const credits = parseFloat(attempted);

    // Faculty / course number / name
    const faculty = tokens.shift();
    const courseNumber = tokens.shift();
    const courseName = tokens.join(" ");

    const status =
      grade === null && classAverage === null
        ? "in-progress"
        : grade === "WD"
        ? "withdrawn"
        : grade === "WE"
        ? "withdrawn"
        : grade === "P"
        ? "pass"
        : "completed";

    result[currentTerm].push({
      "course-name": courseName,
      "faculty": faculty,
      "course-number": courseNumber,
      "credits": credits,
      "grade": grade,
      "class-average": classAverage,
      "class-size": classSize,
      "status": status
    });
  }

  return result;
}




export const parseTranscript = (transcriptText) => {
  const lines = transcriptText.split("\n");

  const courseRegex =
    /^([A-Z]{3,4})\s+(\d{2,3}[A-Z]?)\s+(.+?)\s+(\d+\.\d{2})\s+(\d+\.\d{2})\s+([A-Z][+-]?|-)\s+([\d.]+|-)\s+([A-Z][+-]?|-)\s+(\d+)$/;

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

    const isInProgress = grade === "-" || _gradePoints === "-";

    courses.push({
      "course-name": courseName,
      "faculty": faculty,
      "course-number": courseNumber,
      "credits": parseFloat(credits),
      "grade": isInProgress ? null : grade,
      "class-average": classAverage === "-" ? null : classAverage,
      "class-size": parseInt(classSize, 10),
      "status": isInProgress ? "in-progress" : "completed"
    });
  }

  return courses;
}
  