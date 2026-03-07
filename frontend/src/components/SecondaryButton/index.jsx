
import styles from './SecondaryButton.module.css'

export const SecondaryButton = ({ label, onClick } ) => {

    const SFU_DARK_RED = "#A3002B";
    const SFU_RED = "#CC0633";
    
    return(
        <button 
        onClick={onClick}
        className={styles.SecondaryButton}
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = SFU_RED;
            e.currentTarget.style.color = SFU_RED;
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "#ccc";
            e.currentTarget.style.color = "#333";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
            {label}
        </button>
    )
}