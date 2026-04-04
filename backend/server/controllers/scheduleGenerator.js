

export const GenerateSchedule = (rawData) => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const schedule = daysOfWeek.map((day) => ({ day, classes: [] }));
  
    const dayMap = {
      Mo: "Monday",
      Tu: "Tuesday",
      We: "Wednesday",
      Th: "Thursday",
      Fr: "Friday",
    };
  
    const palette = ["#E8930A", "#4A4A9C", "#5BC8E8", "#2EAE6E", "#E85B5B", "#9C4A9C"];
    let colorIndex = 0;
    const courseColors = {};
  
    rawData.forEach((courseObj) => {
      const info = courseObj.info;
      const courseSchedule = courseObj.courseSchedule;
  
      if (!info || !Array.isArray(courseSchedule)) return;
  
      const courseName = courseObj.courseCode || info.name?.split(" ").slice(0, 2).join(" ");
      const category = info.dept === "IAT" ? "SIAT" : info.dept || courseObj.departmentCode;
  
      if (!courseColors[courseName]) {
        courseColors[courseName] = palette[colorIndex % palette.length];
        colorIndex++;
      }
  
      const courseColor = courseColors[courseName];
  
      courseSchedule.forEach((session) => {
        if (!session.days || !session.startTime) return;
  
        const scheduledDays = session.days.split(",").map((d) => d.trim());
  
        scheduledDays.forEach((dayAbbr) => {
          const fullDay = dayMap[dayAbbr];
          if (!fullDay) return;
  
          const dayData = schedule.find((d) => d.day === fullDay);
          if (!dayData) return;
  
          dayData.classes.push({
            time: session.startTime,
            endTime: session.endTime || null,
            category,
            course: courseName,
            section: courseObj.section || info.section || null,
            campus: session.campus || null,
            color: courseColor,
          });
        });
      });
    });
  
    schedule.forEach((dayObj) => {
      dayObj.classes.sort((a, b) => a.time.localeCompare(b.time));
    });
  
    return schedule.filter((dayObj) => dayObj.classes.length > 0);
  };