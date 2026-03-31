
import styles from './CourseCatalogueView.module.css'
import { useState, useEffect } from 'react';
import { Sidebar } from "../../components/Sidebar"

const CourseCard = ({ course, onTogglePlan }) => {
    // Returns card component for displaying course
    return (
        <div className={styles.courseCard}>
            <div className={styles.courseBadge}>{course.type}</div>
            <div className={styles.courseBody}>
                <div className={styles.cardTitleRow}>
                    <span className={styles.cardCode}>{course.courseCode}</span>
                    <span className={styles.cardName}>{course.courseTitle}</span>
                </div>

                <div className={styles.cardPrereq}>
                    Pre-Req: <span>{course.info.prerequisites || "None"}</span>
                </div>
                <div className={styles.cardTags}>
                    <span className={`${styles.tag} ${styles.tagCore}`}>
                        {course.courseSchedule[0]?.campus}
                    </span>
                    <span className={`${styles.tag} ${styles.tagInperson}`}>{course.info.deliveryMethod}</span>
                    <span className={`${styles.tag} ${styles.tagTerm}`}>{course.section}</span>
                    <span className={`${styles.tag} ${styles.tagTerm}`}>{course.termLabel}</span>
                </div>
                <div className={styles.cardInstructor}>
                    {course.instructor.length > 0 ? (
                        course.instructor.map((i) => i.name).join(", ")
                    ) : "Not Announced"}
                    </div>
            </div>
            <div className={styles.cardRight}>
                <span className={styles.cardCredits}>{course.info.units} Cr</span>
                <button
                    className={`${styles.btnPlan} ${course.planned ? styles.btnPlanPlanned : styles.btnPlanAdd}`}
                    onClick={() => onTogglePlan(course._id)}
                >
                    {course.planned ? "✓ Planned" : "+ Plan"}
                </button>
            </div>
        </div>
    );
}

const FilterGroup = ({ title, options, checked, onChange }) => {
    // Filter checkbox group
    return (
        <div className={styles.filterGroup}>
            <div className={styles.filterGroupTitle}>{title}</div>
            {options?.map(opt => (
                <label key={opt} className={styles.filterOption}>
                    <input
                        type="checkbox"
                        checked={checked.includes(opt)}
                        onChange={() => onChange(opt)}
                    />
                    {opt}
                </label>
            ))}
        </div>
    );
}

const FiltersPanel = ({ filters, onToggle }) => {
    // Panel housing for filter groups
    const DEPT_FILTERS = ["SIAT", "CMPT", "MACM", "ARCH"];
    const REQ_FILTERS = ["SIAT Core", "SIAT Upper", "Computing", "Breadth"];
    const LEVEL_FILTERS = ["1XX", "2XX", "3XX", "4XX"];
    const DELIVERY_FILTERS = ["In-person", "Online", "Hybrid"];
    const TERM_FILTERS = ["Spring 2026", "Summer 2026", "Fall 2026"];

    return (
        <div className={styles.filtersPanel}>
            <div className={styles.filtersTitle}>Filters</div>
            <FilterGroup title="Department" optizons={DEPT_FILTERS} checked={filters.dept} onChange={v => onToggle("dept", v)} />
            <FilterGroup title="Requirement" options={REQ_FILTERS} checked={filters.req} onChange={v => onToggle("req", v)} />
            <FilterGroup title="Course Level" options={LEVEL_FILTERS} checked={filters.level} onChange={v => onToggle("level", v)} />
            <FilterGroup title="Delivery" options={DELIVERY_FILTERS} checked={filters.delivery} onChange={v => onToggle("delivery", v)} />
            <FilterGroup title="Term" options={TERM_FILTERS} checked={filters.term} onChange={v => onToggle("term", v)} />
        </div>
    );
}

export const CourseCatalogue = ( { numResults=7 } ) => {
    // hard coded filter strings
    const CHIPS = ["All", "SIAT Core", "Upper Division", "Breadth", "No Pre-reqs", "Online Only"];

    const [search, setSearch] = useState("");
    const [activeChip, setChip] = useState("All");
    const [courses, setCourses] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(numResults);

    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Might remove later
    const [filters, setFilters] = useState({
        dept: [], req: ["SIAT Core"], level: [], delivery: [], term: []
    });

    const BACK_PORT = 5050;

    // Set active filters
    const totalActive = Object.values(filters).flat().length;


    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search: search
            });
            const res = await fetch(`http://localhost:${BACK_PORT}/api/sfuCourses/available-courses?${params}`, {
                method: "GET"
            });
            if (!res.ok) {
                throw new Error("Failed to fetch courses");
            }

            const data = await res.json();

            setCourses(data.items);
            setTotal(data.total);
            setTotalPages(data.totalPages);
            // return (data);
        } catch (err) {
            setError(err.message || "Something went wrong");
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
          fetchCourses();
        }, 100);
      
        return () => clearTimeout(delay);
      }, [search]);

    useEffect(() => {
        console.log("courses changed:", courses);
      }, [courses]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);          // reset to first page when searching
        setSearch(inputValue);
    };

    // Toggle filters
    function toggleFilter(group, value) {
        setFilters(prev => {
            const arr = prev[group];
            return {
                ...prev,
                [group]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
            };
        });
    }

    // See if planned
    function togglePlan(id) {
        setCourses(prev => prev.map(c => c._id === id ? { ...c, planned: !c.planned } : c));
    }

    // // Format displayed
    // const displayed = courses.filter(c =>
    //     c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
    //     c.courseTitle.toLowerCase().includes(search.toLowerCase())
    // );

    useEffect(() => {
        fetchCourses();
      }, [page, search]);

    return (
        <>
            {/* <div className={styles.container}>
                <Sidebar /> */}
                <div 
                className={styles.main} 
                >
                    <div className={styles.content}>
                        {/* Header row */}
                        <div className={styles.resultBar}>
                            <h1 className={styles.pageTitle}>Course Catalogue</h1>
                            {/* WIP */}
                            {/* <div className={styles.sortBar}>
                                Sort by:
                                <select className={styles.sortSelect}>
                                    <option>Relevance</option>
                                    <option>Name</option>
                                    <option>Credits</option>
                                </select>
                            </div> */}
                        </div>

                        {/* Results count WIP
                        => Too lazy to create separate className
                        */}
                        {/* <div style={{ marginBottom: 12, fontSize: 14, color: "#555" }}>
                            <span style={{ color: "#c8102e", fontWeight: 600 }}>{courses?.length} courses found</span>
                            {totalActive > 0 && (
                                <> | <span className={styles.filterActive}>{totalActive} filter{totalActive > 1 ? "s" : ""} active</span></>
                            )}
                        </div> */}

                        {/* Search => Not using InputField component for more precise styling */}
                        <input
                            className={styles.searchBox}
                            placeholder="Search by course code, title, keyword, or instructor..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {/* Chips */}
                        <div className={styles.chips}>
                            {CHIPS.map(chip => (
                                <div
                                    key={chip}
                                    className={`${styles.chip} ${activeChip === chip ? "active" : ""}`}
                                    onClick={() => setChip(chip)}
                                >
                                    {chip}
                                </div>
                            ))}
                        </div>

                        {/* Course list */}
                        <div className={styles.courseList}>
                            {courses?.map(course => (
                                <CourseCard key={course._id} course={course} onTogglePlan={togglePlan} />
                            ))}
                        { courses.length === 0 &&
                            <div>
                             <p>No results found.</p>
                            </div>
                        }
                        </div>
                    </div>

                    {/* Filters */}
                    {/* <FiltersPanel filters={filters} onToggle={toggleFilter} /> */}
                </div>
            {/* </div> */}
        </>
    );
}

export const CourseCatalogueView = () => {
    return(
        <div className={styles.container}>
            <Sidebar />
            <CourseCatalogue />
        </div>
    )
}