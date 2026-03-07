import { useState } from 'react';
import { InputField } from "../InputField"
import { PrimaryButton } from "../PrimaryButton"

import styles from "./LogInForm.module.css"

export const LogInForm = () => {

    // States for form handling
    const [form, setForm] = useState( {email: "", password: ""} )
    const update = (field) => (e) => setForm({...form, [field]:e.target.value})
    const canSubmit = form.email && form.password;

    return(
        <>
            <InputField label="Email" type="email" placeholder="asdf@sfu.ca" value={form.email} onChange={update("email")} autoComplete="email" />
            <InputField label="Password" type="password" placeholder="••••••••••••" value={form.password} onChange={update("password")} autoComplete="current-password" />
            <div className={styles.textContainer}>
                <span className={styles.inlineText}>
                    Forgot Password?
                </span>
            </div>
            <PrimaryButton label={"Log In →"} disabled={!canSubmit}/>

        </>
    )
}