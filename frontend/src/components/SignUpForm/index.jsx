
import { useEffect, useState } from "react";
import { InputField } from "../InputField";
import { PrimaryButton } from "../PrimaryButton";
import { TermsCheckbox } from "../TermsCheckbox";
import styles from "./SignUpForm.module.css"

export const SignUpForm = () => {
    const [form, setForm] = useState({ name: "", studentId: "", email: "", password: "", repeatPassword: "" });
    const [agreed, setAgreed] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });
    const canSubmit =
        form.name &&
        form.studentId &&
        form.email &&
        form.password &&
        form.repeatPassword &&
        form.password === form.repeatPassword &&
        agreed;

    const handleSubmit = () => {
        if (canSubmit) setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className={styles.successContainer}>
                <div className={styles.successEmoji}>🎉</div>
                <h2 className={styles.successTitle}>Account Created!</h2>
                <p className={styles.successText}>Welcome to SFU Planly, {form.name.split(" ")[0]}.</p>
                <button
                    onClick={() => {
                        setSubmitted(false);
                        setForm({ name: "", studentId: "", email: "", password: "", repeatPassword: "" });
                        setAgreed(false);
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
            <InputField label="Name" placeholder="Your name" value={form.name} onChange={update("name")} autoComplete="name" />
            <InputField label="Student ID" placeholder="301123412" value={form.studentId} onChange={update("studentId")} autoComplete="off" />
            <InputField label="Email" type="email" placeholder="asdf@sfu.ca" value={form.email} onChange={update("email")} autoComplete="email" />
            <InputField label="Password" type="password" placeholder="••••••••••••" value={form.password} onChange={update("password")} autoComplete="new-password" />
            <InputField
                label="Repeat Password"
                type="password"
                placeholder="••••••••••••"
                value={form.repeatPassword}
                onChange={update("repeatPassword")}
                autoComplete="new-password"
            />
            {form.password && form.repeatPassword && form.password !== form.repeatPassword && (
                <p className={styles.errorText}>Passwords do not match</p>
            )}
            <TermsCheckbox checked={agreed} onChange={() => setAgreed(!agreed)} />
            <PrimaryButton label={"Create Account →"} onClick={handleSubmit} disabled={!canSubmit} />
        </>
    );
};
