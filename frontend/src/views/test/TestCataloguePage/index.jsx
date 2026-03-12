
import {useEffect, useState} from 'react';
import { InputField } from "../../../components/InputField";
import styles from "./TestCataloguePage.module.css"



export const TestCataloguePage = () => {
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({ filter: "" });

    const BACK_PORT = 5050;

    // Update filter word, include prev
    const update = (field) => (e) =>
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));

    // fetch courses
    const fetchWQBCourses = async () => {
        try {
            const res = await fetch(`http://localhost:${BACK_PORT}/api/sfuCourses/breadth-courses`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                const result = await res.json();
                return result.courses || [];
            }
        } catch (e) {
            console.log("Error fetching WQB courses: ", e);
        }

        return [];
    };

    // Fetch courses on mount
    useEffect(() => {
        const handleFetchCourses = async () => {
            const res = await fetchWQBCourses();
            setCourses(res);
        };

        handleFetchCourses();
    }, []);

    const filteredCourses = courses.filter((c) =>
        `${c.courseNumber} ${c.courseTitle}`
            .toLowerCase()
            .includes(formData.filter.toLowerCase())
    );

    return (
        <>
            <h1>Course Catalogue</h1>
            <div>
                <InputField
                    label={"Search for a course"}
                    value={formData.filter}
                    onChange={update("filter")}
                />
            </div>

            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Breadth Courses</span>
                    <a className={styles.viewLink} style={{ color: "#c8102e" }}>
                        View Planner →
                    </a>
                </div>

                <div className={styles.coursesGrid}>
                    {filteredCourses.map((c) => (
                        <div key={c._id} className={`${styles.courseCard} ${c.accent}`}>
                            <div className={styles.courseTop}>
                                <span
                                    className={`${styles.tag} ${
                                        c.tag === "SIAT" ? styles.tagSiat : styles.tagBreadth
                                    }`}
                                >
                                    {c.tag}
                                </span>
                                <span className={styles.courseCredits}>{c.credits}cr</span>
                            </div>
                            <div className={styles.courseName}>{c.courseNumber}</div>
                            <div className={styles.courseName}>{c.courseTitle}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};