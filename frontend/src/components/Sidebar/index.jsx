import { useState, useContext } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import logo from "../../assets/logo.svg"

// Import styles
import styles from "./Sidebar.module.css";

// Components
import { SecondaryButton } from "../SecondaryButton";

// Context
import { AuthContext } from "../../context/AuthContext";

// Temporary icons before using matUI
const HomeIcon = () => (
  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
    <polyline points="9 21 9 12 15 12 15 21"/>
  </svg>
);

const CatalogueIcon = () => (
  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="8" height="10" rx="1"/>
    <rect x="13" y="3" width="8" height="10" rx="1"/>
    <rect x="3" y="16" width="8" height="5" rx="1"/>
    <rect x="13" y="16" width="8" height="5" rx="1"/>
  </svg>
);

const DegreeIcon = () => (
  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const PlannerIcon = () => (
  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const TranscriptIcon = () => (
  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
    <path d="M9 12v1"/>
  </svg>
);

const navItems = [
  { id: "dashboard", label: "Home", icon: <HomeIcon /> },
  { id: "course-catalogue", label: "Course Catalogue", icon: <CatalogueIcon /> },
  { id: "degree", label: "Degree", icon: <DegreeIcon /> },
  { id: "planner", label: "Planner", icon: <PlannerIcon /> },
  { id: "transcript", label: "Transcript", icon: <TranscriptIcon /> },
];

export const Sidebar = () => {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();


  const getInitials = (name) => {
    if (!name) return "";
    return name
      .trim()
      .split(/\s+/)             // handles multiple spaces
      .slice(0, 2)              // optional: limit to first + last
      .map(word => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.accentBar} />

      <div className={styles.profile}>
        <div className={styles.avatar}>{getInitials(user.name)}</div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileInfoH2}>{user?.name || "Guest"}</h2>
          <span className={styles.profileInfoSpan}>SIAT Major | BSc</span>

          <button className={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = location.pathname === `/${item.id}`;

          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              onClick={() => navigate(`/${item.id}`)}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className={styles.logo}>
        <img
          src={logo}
          alt="Logo"
          style={{ width: "70px", height: "70px" }}
        />
      </div>
    </div>
  );
};