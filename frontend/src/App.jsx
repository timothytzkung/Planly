import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./wrappers/ProtectedRoute";

import { PdfUploadPage } from "./views/test/PdfUploadPage";
import { SFUCoursesPage } from "./views/test/SFUCoursesPage";
import { TestCataloguePage } from "./views/test/TestCataloguePage";

import { LandingView } from "./views/LandingView";
import { AuthView } from "./views/AuthView";
import { DashboardView } from "./views/DashboardView";
import { CourseCatalogueView } from "./views/CourseCatalogueView";
import { DegreePlannerView } from "./views/DegreePlannerView";

import { DegreePlanner } from "./components/DegreePlanner"

function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [])

  const BACK_PORT = 5050;

  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingView mounted={mounted} />} />

            <Route path="/login" element={<AuthView />} />

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
              path="/course-catalogue"
              element={
                <ProtectedRoute>
                  <CourseCatalogueView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/degree"
              element={
                <ProtectedRoute>
                  <DegreePlannerView/>
                </ProtectedRoute>
              }
            />
            <Route
              path="devdash"
              element={
                <ProtectedRoute>
                  <DegreePlanner />
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
