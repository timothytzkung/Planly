
import { useState } from 'react';
import styles from './AuthView.module.css';
import logo from "../../assets/logo.svg"
import { Navigate, useNavigate } from 'react-router-dom';

// Components
import { TabSwitcher } from '../../components/TabSwitcher';
import { SignUpForm } from '../../components/SignUpForm';
import { LogInForm } from '../../components/LogInForm';


// Card footer
const CardFooter = ({activeTab, onTabChange}) => {
    return(
        <p className={styles.cardFooterText}>
            {activeTab === "Create Account" ? (
                <>Already have an account?{" "}
                    <span 
                        onClick={() => onTabChange("Log In")}
                        className={styles.cardFooterInlineText}
                    >
                        Sign In
                    </span>
                </>
            ) : (
                <>Don't Have an account?{" "}
                    <span
                        onClick={() => onTabChange("Create Account")}
                        className={styles.cardFooterInlineText}
                    >
                        Sign Up
                    </span>
                </>
            )
        }
        </p>
    )
}


// Card container component for auth view
const Card = ({ activeTab, onTabChange }) => {
    return(
        <div className={styles.cardContainer}>
            <div className={styles.cardInnerContainer}>
                <div className={styles.cardTextContainer}>
                    <img src={logo} style={{
                        width: "70px",
                        height: "70px"
                    }}/>
                    <h1 className={styles.cardHeader}>
                        {
                        activeTab === "Create Account" ? "Create Your Account" :
                        "Welcome Back"
                        }
                    </h1>
                    <p>
                        {activeTab === "Create Account" ? "Join SFU Planly with your Email" :
                        "Sign in to SFU Planly"
                        }
                    </p>
                </div>

                <TabSwitcher activeTab={activeTab} onTabChange={onTabChange}/>
                {activeTab === "Create Account" ? <SignUpForm /> : <LogInForm />}

                { /*  Footer  */}
                <CardFooter activeTab={activeTab} onTabChange={onTabChange} />
            </div>
        </div>
    )
}


// Auth view handler
export const AuthView = () => {
    const [activeTab, setActiveTab] = useState("Log In");
    const navigate = useNavigate();

    return (
        <>
            <div className={styles.container}>
                <div className={styles.textContainer}>
                    <span
                        className={styles.backHomeText}
                        onMouseEnter={e => e.currentTarget.style.color = "#cc1f36"}
                        onMouseLeave={e => e.currentTarget.style.color = "#555"}
                        onClick={() => navigate("/home")}
                    >
                        ← Back to home
                    </span>
                </div>

                { /*  Card */}
                <Card activeTab={activeTab} onTabChange={setActiveTab}/>

            </div>
        </>
    )
}