 import { DegreePlanner } from "../../components/DegreePlanner";
 import { Sidebar } from "../../components/Sidebar";
 import { Schedule } from "../../components/Schedule";

 import { useState, useEffect, useContext } from 'react';
 import { AuthContext } from "../../context/AuthContext";
 import { UserContext } from "../../context/UserContext";

 import styles from "./DegreePlanner.module.css"


 export const DegreePlannerView = () => {

    const [summary, setSummary] = useState(null);
    const { backport, user } = useContext(AuthContext);

    // fetch summaries
    const fetchSummary = async() => {
        try {
            const res = await fetch(`http://localhost:${backport}/api/summary/`, {
                method: "POST",
                headers: {
                    "Content-Type":  "application/json"
                },
                body: JSON.stringify({data: user})
            });
            if (res.ok) {
                const result = await res.json();
                return result;
            }
        } catch (e) {
            console.log("Error fetching summary: ", e);
        }
    }

    // Summary fetching
    useEffect(() => {
        const handleFetchSummary = async() => {
            const result = await fetchSummary();
            setSummary(result);
        }
        if (!summary) {
            handleFetchSummary();
        }
        
    }, [summary])

    return(
        <div className={styles.container}>
            <Sidebar />
            <DegreePlanner summary={summary}/>
            <Schedule />
        </div>
        
    )
 }