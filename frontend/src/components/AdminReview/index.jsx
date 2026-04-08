// CURRENTLY NOT IN USE!
/* 
I will rework this if I got time, otherwise, am using conditional
redirecting for admin (sidebar)
*/

import { useState, useEffect, useContext, Fragment } from "react";

import { AuthContext } from '../../context/AuthContext';

// Star icon
const StarRating = ({ rating }) => (
  <span style={{ color: "#1a1a1a", letterSpacing: 1 }}>
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? "#1a1a1a" : "#d1d5db", fontSize: 14 }}>★</span>
    ))}
  </span>
);

// Admin View
export const AdminReview = () => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [ratingFilter, setRatingFilter] = useState("All Ratings");
  const [viewFlagged, setViewFlagged] = useState(false);

  const { token, backport } = useContext(AuthContext);

  // Updates review (generally for deletion)
  const updateReview = (id, patch) =>
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

    const deleteReview = async (id) => {
      try {
        const res = await fetch(`http://localhost:${backport}/api/sfuCourses/reviews/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        });
    
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Delete failed");
        } // Set review
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    };

  // Sum count of review attributes
  const flaggedCount = reviews.filter((r) => r.flagged).length;
  const hiddenCount = reviews.filter((r) => r.status === "hidden").length;
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:${backport}/api/sfuCourses/reviews/all`);
      if (res.ok) {
        const result = await res.json();
        console.log(result)
        return result;
      }
    } catch (e) {
      console.log("Error fetching reviews :(")
      return [];
    }
  }

  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.course.toLowerCase().includes(q) ||
      r.student.toLowerCase().includes(q) ||
      r.studentId.includes(q) ||
      (r.review && r.review.toLowerCase().includes(q));
    const matchStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Visible" && r.status === "visible") ||
      (statusFilter === "Hidden" && r.status === "hidden") ||
      (statusFilter === "Flagged" && r.flagged);
    const matchRating =
      ratingFilter === "All Ratings" || r.rating === parseInt(ratingFilter);
    const matchFlagged = !viewFlagged || r.flagged;
    return matchSearch && matchStatus && matchRating && matchFlagged;
  });

  useEffect(() => {
    const handleFetchReviews = async () => {
      const res = await fetchReviews();
      setReviews(res);
    }
    handleFetchReviews();
  }, [])

  const styles = {
    page: {
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: "#f9fafb",
      minHeight: "100vh",
      padding: "32px 40px",
      color: "#111827",
      minWidth: "80%",
      maxWidth: "100%",
      margin: "0 auto",
    },
    title: {
      fontSize: 26,
      fontWeight: 700,
      margin: 0,
      letterSpacing: "-0.5px",
    },
    subtitle: {
      color: "#6b7280",
      fontSize: 14,
      marginTop: 4,
      marginBottom: 28,
    },
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16,
      marginBottom: 20,
    },
    statCard: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      padding: "18px 22px",
    },
    statLabel: {
      fontSize: 12,
      color: "#9ca3af",
      marginBottom: 6,
      fontWeight: 500,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    statValue: (color) => ({
      fontSize: 34,
      fontWeight: 800,
      color,
      lineHeight: 1,
    }),
    banner: {
      background: "#fef2f2",
      border: "1px solid #fca5a5",
      borderRadius: 8,
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    bannerText: {
      color: "#b91c1c",
      fontWeight: 600,
      fontSize: 14,
      display: "flex",
      alignItems: "center",
      gap: 6,
    },
    viewFlaggedBtn: {
      border: "1px solid #b91c1c",
      background: "transparent",
      color: "#b91c1c",
      borderRadius: 6,
      padding: "6px 14px",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
    },
    controls: {
      display: "flex",
      gap: 12,
      marginBottom: 16,
      alignItems: "center",
    },
    searchWrap: {
      flex: 1,
      position: "relative",
    },
    searchIcon: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      color: "#9ca3af",
      fontSize: 16,
      pointerEvents: "none",
    },
    searchInput: {
      width: "100%",
      padding: "10px 14px 10px 36px",
      border: "1px solid #d1d5db",
      borderRadius: 8,
      fontSize: 14,
      color: "#111827",
      background: "#fff",
      outline: "none",
      boxSizing: "border-box",
    },
    select: {
      border: "1px solid #d1d5db",
      borderRadius: 8,
      padding: "10px 36px 10px 14px",
      fontSize: 14,
      color: "#374151",
      background: "#fff",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 12px center",
      cursor: "pointer",
      outline: "none",
      minWidth: 130,
    },
    table: {
      width: "100%",
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      overflow: "hidden",
    },
    thead: {
      background: "#f3f4f6",
    },
    th: {
      padding: "12px 16px",
      textAlign: "left",
      fontSize: 12,
      fontWeight: 600,
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: "1px solid #e5e7eb",
    },
    row: (flagged) => ({
      background: flagged ? "#fefce8" : "#fff",
      borderBottom: "1px solid #e5e7eb",
    }),
    td: {
      padding: "14px 16px",
      fontSize: 14,
      verticalAlign: "top",
    },
    courseName: {
      fontWeight: 700,
      fontSize: 14,
    },
    flagLabel: {
      color: "#b45309",
      fontWeight: 600,
      fontSize: 12,
      display: "flex",
      alignItems: "center",
      gap: 4,
      marginTop: 2,
    },
    studentName: {
      fontWeight: 500,
    },
    studentId: {
      color: "#9ca3af",
      fontSize: 12,
    },
    statusBadge: (status) => ({
      color: status === "visible" ? "#16a34a" : "#6b7280",
      fontWeight: 600,
      fontSize: 13,
    }),
    actionBtn: (color) => ({
      background: "none",
      border: "none",
      color,
      fontSize: 13,
      fontWeight: 500,
      cursor: "pointer",
      padding: "2px 4px",
    }),
    reviewBox: {
      padding: "12px 16px 14px",
      background: "inherit",
      borderTop: "1px solid #f3f4f6",
    },
    reviewLabel: {
      fontSize: 12,
      color: "#9ca3af",
      fontWeight: 600,
      marginBottom: 4,
    },
    reviewText: {
      fontStyle: "italic",
      color: "#374151",
      fontSize: 14,
      lineHeight: 1.6,
    },
    flagNote: {
      color: "#b45309",
      fontWeight: 600,
      fontSize: 12,
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginTop: 6,
    },
    dismissBtn: {
      background: "none",
      border: "none",
      color: "#6b7280",
      fontSize: 12,
      cursor: "pointer",
      padding: 0,
      textDecoration: "underline",
    },
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Course Reviews</h1>
      <p style={styles.subtitle}>Manage student-submitted course reviews and ratings</p>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Reviews</div>
          <div style={styles.statValue("#dc2626")}>{reviews.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Flagged</div>
          <div style={styles.statValue("#059669")}>{flaggedCount}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Hidden</div>
          <div style={styles.statValue("#1d4ed8")}>{hiddenCount}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Avg. Rating</div>
          <div style={{ ...styles.statValue("#d97706"), display: "flex", alignItems: "center", gap: 6 }}>
            {avgRating} <span style={{ fontSize: 28 }}>★</span>
          </div>
        </div>
      </div>

      {/* Flagged Banner */}
      {flaggedCount > 0 && (
        <div style={styles.banner}>
          <span style={styles.bannerText}>
            ▶ {flaggedCount} flagged {flaggedCount === 1 ? "review" : "reviews"} need your attention
          </span>
          <button
            style={styles.viewFlaggedBtn}
            onClick={() => setViewFlagged((v) => !v)}
          >
            {viewFlagged ? "View All" : "View Flagged"}
          </button>
        </div>
      )}

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Search by course code, title, keyword, or instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          style={styles.select}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Status</option>
          <option>Visible</option>
          <option>Hidden</option>
          <option>Flagged</option>
        </select>
        <select
          style={styles.select}
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option>All Ratings</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n} Star{n !== 1 ? "s" : ""}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={styles.table}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={styles.thead}>
            <tr>
              {["Course", "Student", "Rating", "Date", "Status", "Actions"].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...styles.td, textAlign: "center", color: "#9ca3af", padding: 32 }}>
                  No reviews match your filters.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <Fragment key={r.id}>
                <tr style={styles.row(r.flagged)}>
                  <td style={styles.td}>
                    <div style={styles.courseName}>{r.course}</div>
                    {r.flagged && (
                      <div style={styles.flagLabel}>▶ Flagged</div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.studentName}>{r.student}</div>
                    <div style={styles.studentId}>{r.studentId}</div>
                  </td>
                  <td style={styles.td}>
                    <StarRating rating={r.rating} />
                  </td>
                  <td style={{ ...styles.td, color: "#6b7280" }}>{r.date}</td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(r.status)}>
                      {r.status === "visible" ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.actionBtn("#6b7280")}
                      onClick={() =>
                        updateReview(r.id, {
                          status: r.status === "visible" ? "hidden" : "visible",
                        })
                      }
                    >
                      {r.status === "visible" ? "Hide" : "Show"}
                    </button>
                    <button
                      style={styles.actionBtn("#dc2626")}
                      onClick={() => deleteReview(r.id)}
                    >
                      Delete
                    </button>
                    <button
                      style={styles.actionBtn(r.flagged ? "#d97706" : "#6b7280")}
                      onClick={() => updateReview(r.id, { flagged: !r.flagged })}
                    >
                      {r.flagged ? "Unflag" : "Flag"}
                    </button>
                    {r.review && (
                      <button
                        style={styles.actionBtn("#3b82f6")}
                        onClick={() => updateReview(r.id, { expanded: !r.expanded })}
                      >
                        {r.expanded ? "▲" : "▼"}
                      </button>
                    )}
                  </td>
                </tr>
                {r.review && r.expanded && (
                  <tr key={`${r.id}-review`} style={styles.row(r.flagged)}>
                    <td colSpan={6} style={{ padding: 0 }}>
                      <div style={styles.reviewBox}>
                        <div style={styles.reviewLabel}>Full Review</div>
                        <div style={styles.reviewText}>{r.review}</div>
                        {r.flagged && (
                          <div style={styles.flagNote}>
                            ▶ This review has been flagged
                            <button
                              style={styles.dismissBtn}
                              onClick={() => updateReview(r.id, { flagged: false })}
                            >
                              Dismiss flag
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}