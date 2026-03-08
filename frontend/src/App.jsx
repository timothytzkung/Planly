import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./wrappers/ProtectedRoute";

import { PdfUploadPage } from "./views/test/PdfUploadPage";
import { SFUCoursesPage } from "./views/test/SFUCoursesPage";

import { LandingView } from "./views/LandingView";
import { AuthView } from "./views/AuthView";

function App() {
  // state for demo components has been retired

  const BACK_PORT = 5050;

  // const getHello = async () => {
  //   await fetch(`http://localhost:${BACK_PORT}/api/hello`)
  //     .then((response) => response.json())
  //     .then((data) => setMessage(data.message))
  //     .catch((error) => console.error("Error fetching data:", error));
  // };

  // useEffect(() => {
  //   // // Note: We use the FULL URL. There is no proxy to infer the host.
  //   // getHello();
  // });

  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/home" element={ <LandingView /> }/>
            <Route path="/login" element={ <AuthView />} />
            <Route path="/register" element={ <AuthView initialTab="Create Account" />} />

            {/* Protected Routes */}
            <Route 
              path="/"
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

      {/* legacy demo code removed */}
    </div>
  );
}

export default App;
