
import styles from "./TabSwitch.module.css";

// Button
const TabButton = ( { tab, isActive, onTabChange } ) => {
    return(
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          style={{
            flex: 1,
            padding: "10px 0",
            border: "none",
            borderRadius: "9px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: isActive ? 600 : 400,
            color: isActive ? "#cc1f36" : "#777",
            background: isActive ? "#fff" : "transparent",
            boxShadow: isActive ? "0 1px 6px rgba(0,0,0,0.10)" : "none",
            transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
          }}
        >
          {tab}
        </button>
    )
}

// Core component
export const TabSwitcher = ({ activeTab, onTabChange }) => {
    return(
        <div className={styles.container}>
            {/*  Tabs Array  */}
            { ["Log In", "Create Account"].map((tab) => {
                const isActive = activeTab === tab;
                return (
                    <TabButton 
                        key={tab}
                        tab={tab} 
                        isActive={isActive}
                        onTabChange={onTabChange}
                    />
                )
            }) }
        </div>
    )
}