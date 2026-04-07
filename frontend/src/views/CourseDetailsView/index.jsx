import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar"
import { ReviewSection } from "../../components/ReviewSection"


// Can't be bothered to modularize css anymore oml

// Claude generated star lol
const starIcon = (filled) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill={filled ? "#F59E0B" : "none"}
    stroke="#F59E0B"
    strokeWidth="1.2"
  >
    <polygon points="7,1 8.8,5.2 13.4,5.5 10,8.6 11.1,13.1 7,10.6 2.9,13.1 4,8.6 0.6,5.5 5.2,5.2" />
  </svg>
);

const StarRow = ({ rating, max = 5 }) => (
  <span style={{ display: "inline-flex", gap: 2 }}>
    {Array.from({ length: max }, (_, i) => starIcon(i < Math.round(rating)))}
  </span>
);

const RatingBar = ({ star, count, max }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6B7280" }}>
    <span style={{ width: 16, textAlign: "right" }}>{star}★</span>
    <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${(count / max) * 100}%`,
          background: "#F59E0B",
          borderRadius: 3,
          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
    <span style={{ width: 12, textAlign: "right" }}>{count}</span>
  </div>
);

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    default: { background: "#c8102e", color: "#fff", border: "1px solid #E5E7EB" },
    primary: { background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" },
    green: { background: "#D1FAE5", color: "#065F46", border: "1px solid #A7F3D0" },
    grey: { background: "#ebebeb", color: "#000", border: "1px solid #BFDBFE" },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.01em",
        fontFamily: "'DM Sans', sans-serif",
        ...styles[variant],
      }}
    >
      {children}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      gap:  "2rem",
      alignItems: "center",
      padding: "10px 0",
      borderBottom: "1px solid #F3F4F6",
    }}
  >
    <span style={{ fontSize: 13, color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>
      {value}
    </span>
  </div>
);

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      padding: "24px",
      ...style,
    }}
  >
    {children}
  </div>
);

function formatSchedule(schedule) {
  if (!schedule || schedule.length === 0) return "TBA";
  return schedule
    .filter((s) => !s.isExam)
    .map((s) => `${s.days} ${s.startTime}–${s.endTime}`)
    .join(", ");
}

function formatDates(schedule) {
  if (!schedule || schedule.length === 0) return "";
  const s = schedule[0];
  if (!s.startDate || !s.endDate) return "";
  const fmt = (d) => new Date(d).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
  return `${fmt(s.startDate)} – ${fmt(s.endDate)}`;
}



export const CourseDetails = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [instructorInfo, setInstructorInfo] = useState(null);

  const { courseId } = useParams();
  const location = useLocation();
  const course = location.state?.course;

  if (!course) return <div>No course data</div>;

  const { info, courseSchedule, instructor, courseTitle, section, termLabel } = course;
  const title = info?.title || courseTitle || "Untitled Course";
  const courseCode = `${course.departmentCode} ${course.courseNumber}`;
  const description = info?.description || "";
  const units = info?.units || "3";
  const delivery = info?.deliveryMethod || "In Person";
  const prerequisites = info?.prerequisites || "None";
  const corequisites = info?.corequisites || "None";
  const term = termLabel || info?.term || "";
  const designation = info?.designation || "";
  const campus = courseSchedule?.[0]?.campus || "";

  // Placeholder ratings
  const avgRating = "N/A";
  const reviewCount = 0;
  const ratingDist = [
    { star: 5, count: 0 },
    { star: 4, count: 0 },
    { star: 3, count: 0 },
    { star: 2, count: 0 },
    { star: 1, count: 0 },
  ];
  const instructorName =
    instructor && instructor.length > 0
      ? instructor.map((i) => i.name || i.displayName).join(", ")
      : "TBA";

  const getInstructorInfo = async (name) => {
    try {
      const response = await fetch(`https://api.sfucourses.com/v1/rest/reviews/instructors/${name}`)
      if (!response.ok) {
        throw new Error("Response status: ", response.status)
      }
      const result = await response.json();
      return result

    } catch (e) {
      return 0;
    }
  }

  useEffect(() => {
    const handleGetInstructorInfo = async () => {
      const res = await getInstructorInfo(instructorName)
      setInstructorInfo(res)
    }
    handleGetInstructorInfo()
  }, [course, courseId])


  return (
    <div
      style={{
        marginTop: "2rem",
        background: "#FAFAFA",
        minHeight: "100vh",
        padding: "0 0 60px",
        width: "80%"
      }}
    >

      {/* Breadcrumb */}
      <div style={{ padding: "18px 40px 0", color: "#9CA3AF", fontSize: 13 }}>
        <span style={{ cursor: "pointer", color: "#6B7280" }}>Course Catalogue</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: "#374151", fontWeight: 600 }}>{courseCode}</span>
      </div>

      {/* Header */}
      <div
        style={{
          padding: "16px 40px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontFamily: "Poppins",
              fontSize: 30,
              fontWeight: 700,
              color: "#111827",
              lineHeight: 1.2,
            }}
          >
            {courseCode}{" "}
            <span style={{ color: "#6B7280", fontSize: 22, fontWeight: 400 }}>— {title}</span>
          </h1>
          {/* Badges */}
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {designation && <Badge variant="primary">{designation}</Badge>}
            {units && <Badge variant="default">{campus}</Badge>}
            {delivery && <Badge variant="green">{delivery}</Badge>}
            {units && <Badge variant="grey">{section}</Badge>}
            {term && <Badge variant="grey">{term}</Badge>}
            {units && <Badge variant="grey">{units} credits</Badge>}
          </div>
        </div>

        {/* Rating + Plan */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 34,
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1,
              }}
            >
              {instructorInfo?.overall_rating && "N/A"}
            </div>
            <StarRow rating={avgRating} />
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{reviewCount} reviews</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "20px 40px 0", borderBottom: "1px solid #E5E7EB" }}>
        {["overview", "reviews"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: "none",
              border: "none",
              padding: "8px 0",
              marginRight: 28,
              fontSize: 14,
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? "#DC2626" : "#6B7280",
              cursor: "pointer",
              borderBottom: activeTab === tab ? "2px solid #DC2626" : "2px solid transparent",
              fontFamily: "'DM Sans', sans-serif",
              transition: "color 0.15s",
            }}
          >
            {tab === "overview" ? "Overview" : `Reviews`}
          </button>
        ))}
      </div>

      {/* Body */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 24,
          padding: "28px 40px 0",
          maxWidth: 1100,
        }}
      >
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {activeTab === "overview" ? (
            <>
              {/* Description */}
              <Card>
                <h2
                  style={{
                    margin: "0 0 12px",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#111827",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Course Description
                </h2>
                <p style={{ margin: 0, fontSize: 13.5, color: "#4B5563", lineHeight: 1.7 }}>
                  {description}
                </p>
              </Card>

              {/* Schedule */}
              {courseSchedule && courseSchedule.length > 0 && (
                <Card>
                  <h2
                    style={{
                      margin: "0 0 14px",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#111827",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Schedule
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {courseSchedule
                      .filter((s) => !s.isExam)
                      .map((s, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 14px",
                            background: "#F9FAFB",
                            borderRadius: 8,
                            fontSize: 13,
                          }}
                        >
                          <span
                            style={{
                              background: "#FEF3C7",
                              color: "#92400E",
                              borderRadius: 6,
                              padding: "2px 8px",
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {s.days}
                          </span>
                          <span style={{ color: "#374151", fontWeight: 600 }}>
                            {s.startTime} – {s.endTime}
                          </span>
                          <span style={{ color: "#9CA3AF" }}>{s.sectionCode}</span>
                          <span style={{ color: "#9CA3AF", marginLeft: "auto" }}>{s.campus}</span>
                        </div>
                      ))}
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                      {formatDates(courseSchedule)}
                    </div>
                  </div>
                </Card>
              )}

              {/* Notes */}
              {info?.notes && (
                <Card style={{ borderLeft: "3px solid #FDE68A", background: "#FFFBEB" }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#78350F", lineHeight: 1.6 }}>
                    ⚠️ {info.notes}
                  </p>
                </Card>
              )}

              {/* Instructor */}
              <Card>
                <h2
                  style={{
                    margin: "0 0 14px",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#111827",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Instructor
                </h2>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                      {instructorName}
                    </div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                      {course.departmentName || "Department"}
                    </div>
                  </div>
                  {instructorName !== "TBA" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 13,
                        color: "#6B7280",
                      }}
                    >
                      <StarRow rating={instructorInfo?.overall_rating} />
                      <span style={{ fontWeight: 600, color: "#374151" }}>
                        {instructorInfo?.overall_rating} avg
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <ReviewSection courseCode={courseCode}/>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Course Info */}
          <Card>
            <h2
              style={{
                margin: "0 0 4px",
                fontSize: 15,
                fontWeight: 700,
                color: "#111827",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Course Info
            </h2>
            <div>
              <InfoRow label="Prerequisite" value={prerequisites || "None"} />
              <InfoRow label="Co-requisite" value={corequisites || "None"} />
              <InfoRow label="Credits" value={`${units} units`} />
              <InfoRow label="Delivery" value={delivery} />
              <InfoRow label="Section" value={section} />
              {campus && <InfoRow label="Campus" value={campus} />}
              <InfoRow label="Offered" value={term} />
            </div>
          </Card>

          {/* Student Ratings */}
          <Card>
            <h2
              style={{
                margin: "0 0 16px",
                fontSize: 15,
                fontWeight: 700,
                color: "#111827",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Student Ratings
            </h2>
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 42,
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1,
                  }}
                >
                  {avgRating}
                </div>
                <StarRow rating={avgRating} />
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                  {reviewCount} reviews
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                {ratingDist.map(({ star, count }) => (
                  <RatingBar key={star} star={star} count={count} max={2} />
                ))}
              </div>
            </div>
            <button
              onClick={() => setActiveTab("reviews")}
              style={{
                width: "100%",
                padding: "9px",
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 13,
                color: "#374151",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Read all reviews →
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const CourseDetailsView = ({ course }) => {
  return (
    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
      <Sidebar />
      <CourseDetails course={course} />
    </div>

  )
}