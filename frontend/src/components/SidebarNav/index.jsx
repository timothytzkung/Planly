
import styles from "./SidebarNav.module.css";

// Individual item in nav side
const NavItem = ({ icon, label, active, onClick }) => {
    <button
        className={styles.navItem}
        onClick={onClick}
    >
        <span className={styles.navItem__icon}>{icon}</span>
        {label}
    </button>
}

// Manages sidebar
export const SidebarNav = ({ navItems, activeNav, setActiveNav }) => {
    return (
        <nav className={styles.sidebar__nav}>
            <h2>I am navbar</h2>
            {navItems.map((item) => (
                <NavItem
                    key={item.label}
                    {...item}
                    active={activeNav}
                    onClick={() => setActiveNav(item.label)}
                />
            ))}
        </nav>
    )
}

const profileContainer = ({ props }) => {
    // contains the profile section of sidebar
    return (
        <div className={styles.sidebar__profile}>
            <div className={styles.avatar}>
                <div className={styles.sidebar__profileInfo}>
                    <p className={styles.sidebar__profileName}>
                        {props.name}
                    </p>
                    <p className={sidebar__profileSub}>
                        {props.major}
                    </p>
                </div>
            </div>
        </div>
    )
}

export const Sidebar = ({ navItems, activeNav, setActiveNav }) => {
    <div className={styles.sidebar}>
        <div className={styles.sidebar__top}>

        </div>
    </div>
}