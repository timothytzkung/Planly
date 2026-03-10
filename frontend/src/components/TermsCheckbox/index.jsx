export const TermsCheckbox = ({ checked, onChange }) => {

    //Idk if I'mma separate this later
    // Manages checkbox rendering; will move styles into modules later
    return (
        <div
            onClick={onChange}
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                background: checked ? "rgba(204,31,54,0.06)" : "rgba(204,31,54,0.04)",
                border: `1.5px solid ${checked ? "rgba(204,31,54,0.25)" : "rgba(204,31,54,0.15)"}`,
                borderRadius: "10px",
                padding: "12px 14px",
                cursor: "pointer",
                marginBottom: "20px",
                transition: "all 0.18s",
                userSelect: "none",
            }}
        >
            <div style={{
                width: "17px",
                height: "17px",
                minWidth: "17px",
                borderRadius: "5px",
                border: `2px solid ${checked ? "#cc1f36" : "#bbb"}`,
                background: checked ? "#cc1f36" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "1px",
                transition: "all 0.18s",
            }}>
                {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
            <span style={{
                fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif",
                color: "#444",
                lineHeight: "1.5",
            }}>
                I agree to the{" "}
                <span
                    onClick={e => e.stopPropagation()}
                    style={{ color: "#cc1f36", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
                >
                    terms of service
                </span>{" "}
                and understand my transcript data is stored securely.
            </span>
        </div>
    );
}
