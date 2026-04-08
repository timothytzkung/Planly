// Wrapper for admin dashboard
import { useContext } from "react";
import { Navigate } from "react-router-dom"; // Navigate is used for automatic redirects
import { AuthContext } from "../context/AuthContext";


// Wrapper for redirecting admin to admin dashboard
function DashboardRedirect({ children }) {
    const { user, loading } = useContext(AuthContext);
  
    if (loading) return <div>Loading...</div>;
  
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
  
    return children;
  }

  export default DashboardRedirect;