
import { useEffect, useState } from "react";
import { InputField } from "../InputField";
import { PrimaryButton } from "../PrimaryButton";
import { TermsCheckbox } from "../TermsCheckbox";
import styles from "./SignUpForm.module.css"

import { AuthContext } from "../../context/AuthContext";
import {useNavigate} from "react-router-dom";

export const SignUpForm = () => {
    const [formData, setFormData] = useState({ name: "", studentID: "", email: "", password: "" });
    const [agreed, setAgreed] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });
    const canSubmit = formData.name && formData.studentID && formData.email && formData.password && agreed;

    const BACK_PORT = 5050;
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        if (canSubmit) {
            e.preventDefault()
            setSubmitted(true)
            try {
                const res = await fetch(`http://localhost:${BACK_PORT}/api/auth/register`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(formData)
                })
                // await response
                const data = await res.json();
                if (res.ok) {
                    alert("Registeration sucessful! Please sign in") // placeholder announcement
                    navigate("/login");
                } else {
                    alert(data.message || "Registration Failed") 
                    setSubmitted(false);
                }
            } catch (err) {
                console.log(err);
                setSubmitted(false);
            }

        };
    };

    if (submitted) {
        return (
            <div className={styles.successContainer}>
                <div className={styles.successEmoji}>🎉</div>
                <h2 className={styles.successTitle}>Account Created!</h2>
                <p className={styles.successText}>Welcome to SFU Planly, {formData.name.split(" ")[0]}.</p>
                <button
                    onClick={() => { setSubmitted(false); setFormData({ name: "", studentID: "", email: "", password: "" }); setAgreed(false); 
                    }}
                    className={styles.backButton}
                >
                    ← Back
                </button>
            </div>
        );
    }

    return (
        <>
            <InputField label="Name" placeholder="Your name" value={formData.name} onChange={update("name")} autoComplete="name" />
            <InputField label="Student ID" placeholder="301123412" value={formData.studentID} onChange={update("studentID")} autoComplete="off" />
            <InputField label="Email" type="email" placeholder="asdf@sfu.ca" value={formData.email} onChange={update("email")} autoComplete="email" />
            <InputField label="Password" type="password" placeholder="••••••••••••" value={formData.password} onChange={update("password")} autoComplete="new-password" />
            <TermsCheckbox checked={agreed} onChange={() => setAgreed(!agreed)} />
            <PrimaryButton label={"Create Account →"} onClick={handleSubmit} disabled={!canSubmit} />
        </>
    );
};
