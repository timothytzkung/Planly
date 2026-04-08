
import { useState, useEffect, useContext } from 'react';

import styles from "./Schedule.module.css";
import { AuthContext } from "../../context/AuthContext";

function CalendarIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <rect x="8" y="14" width="3" height="3" fill="currentColor" stroke="none" />
        </svg>
    );
}

// Component for managing schedule rendering
export const Schedule = () => {
    const { currentCourses, backport } = useContext(AuthContext);

    const [activeDay, setActiveDay] = useState(null);
    const [schedule, setSchedule] = useState(null)

    const fetchSchedule = async() => {
        // format payload
        const payload = currentCourses.map((course) => course.code); // gives array of courses such as ["EDUC 100W", "IAT 100"]
        try {
            const res = await fetch(`http://localhost:${backport}/api/sfuCourses/make-schedule`, {
                method: "POST",
                headers: {
                    "Content-Type":  "application/json"
                },
                body: JSON.stringify({courses: payload})
            });
            if (res.ok) {
                const result = await res.json();
                return result.schedule;
            }
        } catch (e) {
            // Will throw an error if no schedule being generated
            // console.log("Error fetching schedule: ", e);
        }
    }

    // Get schedule
    useEffect(() => {
        const handleFetchSchedule = async() => {
            // console.log(currentCourses)
            const result = await fetchSchedule();
            setSchedule(result);
        }
        if (!schedule) {
            handleFetchSchedule();
        }
    }, [schedule, currentCourses])


    return (
        <>
            <div className={styles.calWrapper}>
                <div className={styles.calCard}>
                    <div className={styles.calHeader}>
                        <h1 className={styles.calTitle}>Calendar</h1>
                        <button className={styles.calIconBtn} aria-label="Open calendar">
                            <CalendarIcon />
                        </button>
                    </div>
                    {!schedule && 
                    <div>
                        Upload Transcript to Generate Schedule!
                    </div>
                    }
                    {schedule?.map((dayData, dayIdx) => (
                        <div key={dayData.day}>
                            <div className={styles.daySection}>
                                <div className={styles.dayHeader}>
                                    <span className={styles.dayLabel}>{dayData.day}</span>
                                    <div
                                        className={styles.dayDots}
                                        onClick={() =>
                                            setActiveDay(activeDay === dayData.day ? null : dayData.day)
                                        }
                                        role="button"
                                        aria-label={`Options for ${dayData.day}`}
                                    >
                                        <span className={styles.dot} />
                                        <span className={styles.dot} />
                                        <span className={styles.dot} />
                                    </div>
                                </div>

                                {dayData.classes.map((cls, idx) => (
                                    <div
                                        className={styles.classItem}
                                        key={idx}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <span className={styles.timeLabel}>{cls.time}</span>
                                        <div
                                            className={styles.colorBar}
                                            style={{ background: cls.color }}
                                        />
                                        <div className={styles.classInfo}>
                                            <span className={styles.classCategory}>{cls.category}</span>
                                            <span className={styles.classCourse}>{cls.course}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {dayIdx < schedule?.length - 1 && (
                                <div className={styles.divider} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

        </>
    )
}