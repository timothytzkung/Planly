import { useState } from "react";
import styles from "./DashboardView.module.css"

// components
import { SidebarNav } from "../../components/SidebarNav";

// Dashboard view, props will contain data
export const DashboardView = (props) => {
    const [activeNav, setActiveNav] = useState("Home");

    // Temp icons until retrieved from matUI
    const navItems = [
        { icon: "🏠", label: "Home" },
        { icon: "📋", label: "Course Catalogue" },
        { icon: "🎓", label: "Degree" },
        { icon: "📅", label: "Planner" },
        { icon: "📄", label: "Transcript" },
    ];

    const advisorLinks = ["Book appointment", "Send message", "View notes", "Resources"];

    // Tmp courses until passed
    const courses = [
        { tag: "SIAT",    tagColor: "#3BB8F5", name: "MACM 100", credits: 3, borderColor: "#3BB8F5" },
        { tag: "SIAT",    tagColor: "#3BB8F5", name: "IAT 206W", credits: 3, borderColor: "#22C77A" },
        { tag: "SIAT",    tagColor: "#F5A623", name: "IAT 235",  credits: 3, borderColor: "#F5A623" },
        { tag: "BREADTH", tagColor: "#22C77A", name: "ARCH 131", credits: 3, borderColor: "#7C3AED" },
    ];

    // Tmp calendar
    const calendarDays = [
        {
          day: "Monday",
          events: [
            { time: "09:00", category: "SIAT",    course: "IAT 235",  color: "#F5A623" },
            { time: "11:00", category: "BREADTH", course: "ARCH 131", color: "#7C3AED" },
          ],
        },
        {
          day: "Tuesday",
          events: [
            { time: "09:00", category: "SIAT", course: "MACM 100", color: "#3BB8F5" },
            { time: "15:00", category: "SIAT", course: "IAT 206W", color: "#22C77A" },
          ],
        },
        {
          day: "Wednesday",
          events: [
            { time: "09:00", category: "SIAT",    course: "IAT 235",  color: "#F5A623" },
            { time: "10:00", category: "BREADTH", course: "ARCH 131", color: "#7C3AED" },
          ],
        },
      ];

      return(
        <div className={styles.dashboard}>
            <h1>Dashboard!</h1>
            <SidebarNav navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav}/>
        </div>
      )
}