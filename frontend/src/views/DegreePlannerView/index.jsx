 import { DegreePlanner } from "../../components/DegreePlanner";
 import { Sidebar } from "../../components/Sidebar";

 import { useState, useEffect, useContext } from 'react';
 import { AuthContext } from "../../context/AuthContext";


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
        <div>
            <Sidebar />
            <DegreePlanner summary={summary}/>
        </div>
        
    )
 }