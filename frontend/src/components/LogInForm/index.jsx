import { useState, useEffect, useContext } from 'react';
import { InputField } from "../InputField"
import { PrimaryButton } from "../PrimaryButton"
import styles from "./LogInForm.module.css"

import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const LogInForm = () => {

    // States for form handling
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });
    const canSubmit = formData.email && formData.password;

    const BACK_PORT = 5050;

    const { token } = useContext(AuthContext);
    const { login } = useContext(AuthContext);

    const navigate = useNavigate();

    // If token exists, redirect to dash
    useEffect(() => {
        if (token) {
            navigate("/dashboard")
        }
    }, [token, navigate, formData])

    const handleSubmit = async (e) => {
        // Pass error
        e.preventDefault();
        setError("");
        console.log(formData);

        if (canSubmit) {
            try {
                const response = await fetch(`http://localhost:${BACK_PORT}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });
                // Await data from backend
                const data = await response.json();

                if (response.ok) {
                    login(data.token);
                    setSubmitted(true)
                    navigate("/dashboard");
                } else {
                    setError(data.message || "Invalid Credentials")
                }
            } catch (err) {
                setError("Server error. Please try again later.");
            }
        }
    }

    return (
        <>
            {error &&
                <div className={styles.errorContainer}>
                    <span className={styles.error}>{error}</span>
                </div>

            }
            <InputField label="Email" type="email" placeholder="asdf@sfu.ca" value={formData.email} onChange={update("email")} autoComplete="email" />
            <InputField label="Password" type="password" placeholder="••••••••••••" value={formData.password} onChange={update("password")} autoComplete="current-password" />
            <div className={styles.textContainer}>
                <span className={styles.inlineText}>
                    Forgot Password?
                </span>
            </div>
            <PrimaryButton label={"Log In →"} disabled={!canSubmit} onClick={handleSubmit} />

        </>
    )
}