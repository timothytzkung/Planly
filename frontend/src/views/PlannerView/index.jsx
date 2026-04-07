import { useEffect, useState, useContext } from "react";
import { Sidebar } from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import { CourseCard } from "../../views/CourseCatalogueView";

import styles from "./PlannerView.module.css";

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
      <div style={{display: "flex", flexDirection: "column", width: "70%"}}>
        <h1 style={{ marginTop: "5rem", marginLeft: "2.25rem" }}>Planner</h1>
        <p style={{ marginLeft: "2.25rem" }}>
          Your saved courses -- manage and organize what you plan to take
        </p>

        <div className={styles.courseList}>
          {loading && <p>Loading courses...</p>}
          {error && <p>{error}</p>}

          {!loading &&
            !error &&
            courses?.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                isPlanned={true}
                onTogglePlan={handleTogglePlan}
                canAdd={true}
              />
            ))}

          {!loading && !error && courses?.length === 0 && (
            <div style={{marginLeft: "2.25rem"}}>
              <p>No results found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};