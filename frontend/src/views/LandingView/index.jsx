
import { PrimaryButton } from "../../components/PrimaryButton";
import { SecondaryButton } from "../../components/SecondaryButton";
import styles from "./LandingView.module.css";

import { CourseCatalogue } from "../../views/CourseCatalogueView"

import { useEffect, useState } from "react";
import logo from "../../assets/logo.svg"

import { Navigate, useNavigate } from "react-router-dom"; 


export const LandingView = ({ mounted }) => {

    const SFU_DARK_RED = "#A3002B";
    const SFU_RED = "#CC0633";

    const navigate = useNavigate();

    // I'm using some inline styling so I can use the useEffect shiz
    return (
        <>
        <div className={styles.main}>
            <div className={styles.topContainer}>
                <img src={logo} style={{
                    width: "70px",
                    height: "70px"
                }}/>
                <div className={styles.buttonContainer}>
                    <SecondaryButton label={"Log In"} onClick={() => navigate("/login")}/>
                    <PrimaryButton label={"Get Started →"} onClick={() => navigate("/login")}/>
                </div>
            </div>


            {/* Main headline */}
            <h1 style={{
                fontSize: "clamp(42px, 7vw, 80px)",
                fontWeight: 800,
                lineHeight: 1.1,
                margin: "0 0 28px",
                color: "#111",
                maxWidth: "1080px",
                letterSpacing: "-1.5px",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(18px)",
                transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
            }}>
                Your degree,{" "}
                <span style={{
                    color: SFU_RED,
                    position: "relative",
                    display: "inline-block",
                }}>
                    planned
                    <span style={{
                        color: "#000000",
                    }}>
                    .
                    </span>
                </span>
            </h1>

            {/* Subheading */}
            <p style={{
                fontSize: "clamp(15px, 2vw, 18px)",
                color: "#555",
                lineHeight: 1.7,
                maxWidth: "1080px",
                margin: "0 0 48px",
                fontFamily: "'Arial', sans-serif",
                fontWeight: 400,
                letterSpacing: "0.1px",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(18px)",
                transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
            }}>
                Frustrated by goSFU's degree planner or want to know when you can graduate at a glance?
                Upload your SFU transcript and get a personalized roadmap that tracks requirements,
                maps semesters, and stay on track to graduate.
            </p>

            {/* CTA Buttons */}
            <div style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                justifyContent: "center",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(18px)",
                transition: "opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s",
            }}>
                <PrimaryButton label={"Upload your PDF →"} />
                <SecondaryButton label={"Log In"} onClick={() => navigate("/login")}/>
            </div>

        </div>
        <CourseCatalogue numResults={4}/>
        <div className={styles.infoCard}>
            <p className={styles.infoCardHeader}>Want to plan these courses?</p>
            <p className={styles.infoCardText}>Create a free account to add courses to your semester plan, track requirements, and see your degree progress.</p>
            <div className={styles.buttonContainer}>
                <PrimaryButton label={"Create Free Account →"} onClick={() => navigate("/login")}/>
            </div>

        </div>
    </>
        
    )
}