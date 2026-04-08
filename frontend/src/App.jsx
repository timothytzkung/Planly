import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./wrappers/ProtectedRoute";
import DashboardRedirect from "./wrappers/DashboardRedirect"

import { LandingView } from "./views/LandingView";
import { AuthView } from "./views/AuthView";
import { DashboardView } from "./views/DashboardView";
import { CourseCatalogueView } from "./views/CourseCatalogueView";
import { DegreeView } from "./views/DegreeView";
import { CourseDetailsView } from "./views/CourseDetailsView";
import { PlannerView } from "./views/PlannerView";
import { AdminView } from "./views/AdminView";
import { TranscriptView } from "./views/TranscriptView"

function App() {
  const [mounted, setMounted] = useState(false);

  // Set mount
  useEffect(() => {
    setMounted(true);
  }, [])

  
  // Routes
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
                  <DashboardRedirect>
                    <DashboardView />
                  </DashboardRedirect>
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
              path="/courses/:courseCode"
              element={
                <ProtectedRoute>
                  <CourseDetailsView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/degree"
              element={
                <ProtectedRoute>
                  <DegreeView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/planner"
              element={
                <ProtectedRoute>
                  <PlannerView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transcript"
              element={
                <ProtectedRoute>
                  <TranscriptView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminView />
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
