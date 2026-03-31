/**
 * Formats raw course JSON data into a structured weekly schedule.
 * @param {Array} rawData - Array of parsed JSON course objects.
 * @returns {Array} Formatted schedule grouped by day.
 */

export const GenerateSchedule = (rawData) => {
    // Initialize the base schedule structure
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const schedule = daysOfWeek.map(day => ({ day, classes: [] }));

    // Mapping for day abbreviations used in the raw data
    const dayMap = {
        "Mo": "Monday",
        "Tu": "Tuesday",
        "We": "Wednesday",
        "Th": "Thursday",
        "Fr": "Friday"
    };

    // Palette to assign consistent colors to courses
    const palette = ["#E8930A", "#4A4A9C", "#5BC8E8", "#2EAE6E", "#E85B5B", "#9C4A9C"];
    let colorIndex = 0;
    const courseColors = {};

    rawData.forEach(courseObj => {
        const info = courseObj.info;
        const courseSchedule = courseObj.courseSchedule;

        // Skip if essential data is missing
        if (!info || !courseSchedule) return;

        // Extract the base course name (e.g., "IAT 206W" from "IAT 206W D100")
        const nameParts = info.name.split(" ");
        const courseName = `${nameParts[0]} ${nameParts[1]}`;

        // Map department to a category (defaults to the department code if not IAT)
        const category = info.dept === "IAT" ? "SIAT" : info.dept;

        // Assign a unique, consistent color to each course
        if (!courseColors[courseName]) {
            courseColors[courseName] = palette[colorIndex % palette.length];
            colorIndex++;
        }
        const courseColor = courseColors[courseName];

        // Process each scheduled session
        courseSchedule.forEach(session => {
            // Skip online/asynchronous sessions with no assigned days or times
            if (!session.days || !session.startTime) return;

            // Handle strings with multiple days like "Mo, We"
            const scheduledDays = session.days.split(",").map(d => d.trim());

            scheduledDays.forEach(dayAbbr => {
                const fullDay = dayMap[dayAbbr];
                if (fullDay) {
                    const dayData = schedule.find(d => d.day === fullDay);
                    if (dayData) {
                        dayData.classes.push({
                            time: session.startTime,
                            category: category,
                            course: courseName,
                            color: courseColor
                        });
                    }
                }
            });
        });
    });

    // Sort the classes chronologically within each day
    schedule.forEach(dayObj => {
        dayObj.classes.sort((a, b) => a.time.localeCompare(b.time));
    });

    // Optional: Remove days that have no classes scheduled
    return schedule.filter(dayObj => dayObj.classes.length > 0);
}

// Example usage
// const rawCourses = [course1, course2, course3, course4];
// const mySchedule = scheduleGenerator(rawCourses);
// console.log(JSON.stringify(mySchedule, null, 2));