import styles from './CourseCatalogueView.module.css';
import { useState, useEffect, useContext, useMemo } from 'react';
import { Sidebar } from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export const CourseCard = ({
  course,
  isPlanned,
  onTogglePlan,
  canAdd = false,
}) => {
  if (!course) return (<></>);
  
  const navigate = useNavigate();
  const { user, token, backport } = useContext(AuthContext);

  const handleClick = () => {
    navigate(`/courses/${course.courseCode}`, { state: { course } });
  };

  const addToFavourites = async () => {
    const res = await fetch(
      `http://localhost:${backport}/api/sfuCourses/add-favourite`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          userId: user._id || user.id,
          courseId: course._id,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to add favourite");
    }

    return await res.json();
  };

  const removeFromFavourites = async () => {
    const res = await fetch(
      `http://localhost:${backport}/api/sfuCourses/remove-favourite`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          userId: user._id || user.id,
          courseId: course._id,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to remove favourite");
    }

    return await res.json();
  };

  const handlePlanClick = async () => {
    const nextPlanned = !isPlanned;

    // instant UI update
    onTogglePlan(course._id, nextPlanned);

    try {
      if (nextPlanned) {
        await addToFavourites();
      } else {
        await removeFromFavourites();
      }
    } catch (e) {
      console.log("Failed to update favourite:", e);

      // rollback UI if API fails
      onTogglePlan(course._id, isPlanned);
    }
  };

  return (
    <div className={styles.courseCard}>
      <div className={styles.cardBadge}>{course.type}</div>

      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow} onClick={handleClick}>
          <span className={styles.cardCode}>{course.courseCode}</span>
          <span className={styles.cardName}>{course.courseTitle}</span>
        </div>

        <div className={styles.cardPrereq}>
          Pre-Req: <span>{course.info?.prerequisites || "None"}</span>
        </div>

        <div className={styles.cardTags}>
          <span className={`${styles.tag} ${styles.tagCore}`}>
            {course.courseSchedule?.[0]?.campus || "Unknown Campus"}
          </span>
          <span className={`${styles.tag} ${styles.tagInperson}`}>
            {course.info?.deliveryMethod || "Unknown"}
          </span>
          <span className={`${styles.tag} ${styles.tagTerm}`}>
            {course.section}
          </span>
          <span className={`${styles.tag} ${styles.tagTerm}`}>
            {course.termLabel}
          </span>
        </div>

        <div className={styles.cardInstructor}>
          {course.instructor?.length > 0
            ? course.instructor.map((i) => i.name).join(", ")
            : "Not Announced"}
        </div>
      </div>

      <div className={styles.cardRight}>
        <span className={styles.cardCredits}>{course.info?.units} Cr</span>

        {canAdd && (
          <button
            className={`${styles.btnPlan} ${isPlanned ? styles.btnPlanPlanned : styles.btnPlanAdd
              }`}
            onClick={handlePlanClick}
          >
            {isPlanned ? "Remove from Plan" : "+ Plan"}
          </button>
        )}
      </div>
    </div>
  );
};

const FilterGroup = ({ title, options, checked, onChange }) => {
  return (
    <div className={styles.filterGroup}>
      <div className={styles.filterGroupTitle}>{title}</div>
      {options?.map((opt) => (
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
};

const FiltersPanel = ({ filters, onToggle }) => {
  const DEPT_FILTERS = ["SIAT", "CMPT", "MACM", "ARCH"];
  const REQ_FILTERS = ["SIAT Core", "SIAT Upper", "Computing", "Breadth"];
  const LEVEL_FILTERS = ["1XX", "2XX", "3XX", "4XX"];
  const DELIVERY_FILTERS = ["In-person", "Online", "Hybrid"];
  const TERM_FILTERS = ["Spring 2026", "Summer 2026", "Fall 2026"];

  return (
    <div className={styles.filtersPanel}>
      <div className={styles.filtersTitle}>Filters</div>
      <FilterGroup
        title="Department"
        options={DEPT_FILTERS}
        checked={filters.dept}
        onChange={(v) => onToggle("dept", v)}
      />
      <FilterGroup
        title="Requirement"
        options={REQ_FILTERS}
        checked={filters.req}
        onChange={(v) => onToggle("req", v)}
      />
      <FilterGroup
        title="Course Level"
        options={LEVEL_FILTERS}
        checked={filters.level}
        onChange={(v) => onToggle("level", v)}
      />
      <FilterGroup
        title="Delivery"
        options={DELIVERY_FILTERS}
        checked={filters.delivery}
        onChange={(v) => onToggle("delivery", v)}
      />
      <FilterGroup
        title="Term"
        options={TERM_FILTERS}
        checked={filters.term}
        onChange={(v) => onToggle("term", v)}
      />
    </div>
  );
};

export const CourseCatalogue = ({ numResults = 7, canAdd }) => {
  const CHIPS = [
    "All",
    "SIAT Core",
    "Upper Division",
    "Breadth",
    "No Pre-reqs",
    "Online Only",
  ];

  const { user, token, backport } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeChip, setActiveChip] = useState("All");
  const [courses, setCourses] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(numResults);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BACK_PORT = 5050;

  function getChipParams(chip) {
    switch (chip) {
      case "SIAT Core":
        return { departmentCode: "IAT" };
      case "Upper Division":
        return { level: "upper" };
      case "Breadth":
        return { designation: "Writing" };
      case "No Pre-reqs":
        return { noPrereqs: "true" };
      case "Online Only":
        return { deliveryMethod: "Online" };
      case "All":
      default:
        return {};
    }
  }

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const chipParams = getChipParams(activeChip);
      Object.entries(chipParams).forEach(([key, value]) => {
        params.set(key, value);
      });

      const res = await fetch(
        `http://localhost:${BACK_PORT}/api/sfuCourses/available-courses?${params.toString()}`,
        { method: "GET" }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await res.json();

      setCourses(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setCourses([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavourites = async () => {
    if (!user || !token) return;

    try {
      const res = await fetch(
        `http://localhost:${backport}/api/sfuCourses/get-favourites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            userId: user._id || user.id,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch favourites");
      }

      const data = await res.json();

      return (data || []).map((fav) => fav._id.toString());
    } catch (e) {
      console.log("Error fetching favourites:", e);
      return ([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (debouncedSearch.trim()) {
          params.set("search", debouncedSearch.trim());
        }

        const chipParams = getChipParams(activeChip);
        Object.entries(chipParams).forEach(([key, value]) => {
          params.set(key, value);
        });

        const res = await fetch(
          `http://localhost:${BACK_PORT}/api/sfuCourses/available-courses?${params.toString()}`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        if (!res.ok) throw new Error("Failed to fetch courses");

        const data = await res.json();
        setCourses(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCourses();

    return () => controller.abort();
  }, [page, debouncedSearch, activeChip]);

  const handleChipClick = (chip) => {
    setPage(1);
    setActiveChip(chip);
  };

  const handleTogglePlan = (courseId, shouldBePlanned) => {
    const id = courseId.toString();

    setFavourites((prev) => {
      if (shouldBePlanned) {
        return prev.includes(id) ? prev : [...prev, id];
      }

      return prev.filter((favId) => favId !== id);
    });
  };

  const favouriteSet = useMemo(() => new Set(favourites), [favourites]);

  return (
    <div className={styles.main}>
      <div className={styles.content}>
        <div className={styles.resultBar}>
          <h1 className={styles.pageTitle}>Course Catalogue</h1>
        </div>

        <input
          className={styles.searchBox}
          placeholder="Search by course code, title, or keyword..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        <div className={styles.chips}>
          {CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`${styles.chip} ${activeChip === chip ? styles.active : ""
                }`}
              onClick={() => handleChipClick(chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className={styles.courseList}>
          {error && <p>{error}</p>}
          {loading && <p>Updating courses...</p>}

          {!error &&
            courses?.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                isPlanned={favouriteSet.has(course._id.toString())}
                onTogglePlan={handleTogglePlan}
                canAdd={canAdd}
              />
            ))}

          {!loading && !error && courses.length === 0 && (
            <div>
              <p>No results found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CourseCatalogueView = ({ canAdd = true }) => {
  return (
    <div className={styles.container}>
      <Sidebar />
      <CourseCatalogue canAdd={canAdd} />
    </div>
  );
};