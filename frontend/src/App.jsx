import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./wrappers/ProtectedRoute";

import { PdfUploadPage } from "./views/test/PdfUploadPage";
import { SFUCoursesPage } from "./views/test/SFUCoursesPage";

import { LandingView } from "./views/LandingView";
import { AuthView } from "./views/AuthView";
import {DashboardView} from "./views/DashboardView";

function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  },[])

  const BACK_PORT = 5050;

  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={ <LandingView mounted={mounted}/> }/>
            
            <Route path="/login" element={ <AuthView />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardView />
                </ProtectedRoute>
              } 
            />
            <Route
              path="devdash"
              element={
                <ProtectedRoute>
                  <PdfUploadPage />
                  <SFUCoursesPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>

    </div>
  );
}

export default App;
