
import styles from "./InputField.module.css";

export const InputField = ({ label, type = "text", placeholder, value, onChange, autoComplete }) => {

    // Component for managing input fields
    return (
        <div className={styles.container}>
            <label className={styles.label}>
                {label}
            </label>

            <input
                type={type}
                placeholder={placeholder}
                onChange={onChange}
                autoComplete={autoComplete}
                className={styles.input}
                onFocus={e => {
                    e.target.style.borderColor = "#cc1f36";
                    e.target.style.boxShadow = "0 0 0 3px rgba(204,31,54,0.09)";
                    e.target.style.background = "#fff";
                }}
                onBlur={e => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                    e.target.style.background = "#fafafa";
                }}
            />
        </div>
    );
}
