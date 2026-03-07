
import styles from './PrimaryButton.module.css'

export const PrimaryButton = ({ label, onClick } ) => {

    const SFU_DARK_RED = "#A3002B";
    const SFU_RED = "#CC0633";
    
    return(
        <button 
        onClick={onClick}
        className={styles.PrimaryButton}
        onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = SFU_DARK_RED;
            e.currentTarget.style.boxShadow = "0 6px 24px rgba(204,6,51,0.5), 0 2px 6px rgba(204,6,51,0.3)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = SFU_RED;
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(204,6,51,0.4), 0 1px 3px rgba(204,6,51,0.2)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
            {label}
        </button>
    )
}