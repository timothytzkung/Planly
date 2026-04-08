import { useEffect, useState, useContext } from "react";
import { Sidebar } from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import styles from "./PlannerView.module.css";

// Custom course card for planner (modified from coursecatalogue)
const CourseCard = ({
  course,
  isPlanned,
  onTogglePlan,
  canAdd = false,
}) => {
  if (!course) return <></>;

  const navigate = useNavigate();
  const { user, token, backport } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);

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
    if (saving) return;

    const nextPlanned = !isPlanned;

    onTogglePlan(course._id, nextPlanned);
    setSaving(true);

    try {
      if (nextPlanned) {
        await addToFavourites();
      } else {
        await removeFromFavourites();
      }
    } catch (e) {
      console.log("Failed to update favourite:", e);
      onTogglePlan(course._id, isPlanned);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.courseCard}>
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow} onClick={handleClick}>
          <span className={styles.cardCode}>{course.courseCode}</span>
          <span className={styles.cardName}>{course.courseTitle}</span>
          <span style={{ fontSize: 12, color: "#999" }}>Pre-Req: {course.info?.prerequisites || "None"}</span>
        </div>
        <div className={styles.cardTags}>
          <span className={`${styles.tag} ${styles.tagCore}`}>{course.courseSchedule?.[0]?.campus || "SIAT Core"}</span>
          <span className={`${styles.tag} ${styles.tagInperson}`}>{course.info?.deliveryMethod || "In Person"}</span>
          <span className={`${styles.tag} ${styles.tagTerm}`}>{course.section}</span>
          <span className={`${styles.tag} ${styles.tagTerm}`}>{course.termLabel}</span>
        </div>
      </div>
      <div className={styles.cardRight}>
        <span className={styles.cardCredits}>{course.info?.units} Cr</span>
        {canAdd && (
          <div style={{ display: "flex", gap: 6 }}>
            <button className={`${styles.btnPlan} ${styles.btnPlanPlanned}`} onClick={handlePlanClick} disabled={saving}>
              {saving ? "Saving..." : "Remove"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const PlannerView = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);

  const { user, token, backport } = useContext(AuthContext);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `http://localhost:${backport}/api/sfuCourses/get-favourites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ userId: user._id || user.id }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch favourites");
      }

      const result = await res.json();
      setCourses(result);
    } catch (e) {
      console.log("Error fetching courses:", e);
      setError("Failed to load planner courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !token) return;
    fetchCourses();
  }, [user, token]);

  const handleTogglePlan = (courseId, shouldBePlanned) => {
    // In PlannerView, all displayed courses are already planned.
    // If shouldBePlanned is false, remove the course from local UI.
    if (!shouldBePlanned) {
      setCourses((prev) =>
        prev.filter((course) => course._id.toString() !== courseId.toString())
      );
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "40px 0" }}>

        {/* Header */}
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 2.25rem 4px" }}>Planner</h1>
        <p style={{ fontSize: 13.5, color: "#888", margin: "0 2.25rem 28px" }}>
          Your saved courses — manage and organise what you plan to take
        </p>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, margin: "0 2.25rem 28px" }}>
          {[
            { label: "Saved Courses", value: courses.length, color: "#1a1a1a" },
            { label: "Planned Credits", value: courses.reduce((s, c) => s + (parseInt(c.info?.units) || 0), 0), color: "#1d9e75" },
            { label: "Summer 2026", value: "4 courses", color: "#185FA5" },
            { label: "Fall 2026", value: "2 courses", color: "#E8850A" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 11.5, color: "#999", marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Course list */}
        <div className={styles.courseList}>
          {loading && <p>Loading courses...</p>}
          {error && <p style={{ color: "#E8183A" }}>{error}</p>}
          {!loading && !error && courses.map((course) => (
            <CourseCard key={course._id} course={course} isPlanned={true}
              onTogglePlan={handleTogglePlan} canAdd={true} />
          ))}
          {!loading && !error && courses.length === 0 && <p>No results found.</p>}
        </div>
      </div>
    </div>
  );
};