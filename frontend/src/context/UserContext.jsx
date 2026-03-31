import { jwtDecode } from "jwt-decode";
import { createContext, useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";

// create the Context object to be consumed by other components
export const UserContext = createContext();

export function UserProvider({ children }) {
  const [backport, setBackport] = useState(5050);
  const [summary, setSummary] = useState(null);
  const [currentCourses, setCurrentCourses] = useState([]);

  const {user, token } = useContext(AuthContext);


  // fetch summaries
  const fetchSummary = async () => {
    try {
      const res = await fetch(`http://localhost:${backport}/api/summary/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ data: user })
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
    if (user || token) {
      const handleFetchSummary = async () => {
        const result = await fetchSummary();
        setSummary(result);
      }
      if (!summary) {
        handleFetchSummary();
      }
    }

  }, [summary, user])


  return (
    // we provide 'token' and 'user' (data)
    // and 'login' and 'logout' (functions) to the whole app

    <UserContext.Provider value={{ backport, summary, setSummary, currentCourses, setCurrentCourses}}>
      {children}
    </UserContext.Provider>
  );
}