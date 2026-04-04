import styles from "./TranscriptView.module.css";

import { useEffect, useState, useRef, useContext } from 'react';

import { Sidebar } from "../../components/Sidebar";
import { Schedule } from "../../components/Schedule";

export const TranscriptView = () => {


    return(
        <div className={styles.layout}>
            <Sidebar />
        </div>
    )
}