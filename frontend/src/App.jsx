import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./wrappers/ProtectedRoute";

import { PdfUploadPage } from "./views/test/PdfUploadPage";
import { SFUCoursesPage } from "./views/test/SFUCoursesPage";

import { LandingView } from "./views/LandingView";
import { AuthView } from "./views/AuthView";

function App() {
  const [message, setMessage] = useState("");
  const [pdfFile, setPdfFile] = useState("");
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
  },[])

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
            <Route path="/home" element={ <LandingView mounted={mounted}/> }/>
            <Route path="/login" element={ <AuthView />} />

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

      {/* {currentView === "LandingView" ? 
        <LandingView mounted={mounted} /> :
        <>There was an error loading the page!</>  
      } */}
      {/* {currentView === "LandingView" ? 
        <AuthView /> :
        <>There was an error loading the page!</> 
      } */}
      {/* <h1>Planly</h1>
      <p>Server says: {message}</p> */}
      {/* <PrimaryButton label={"Primary Button"}/>
      <SecondaryButton label={"Secondary Button"} />
      <PdfUploadPage />
      <SFUCoursesPage /> */}

    </div>
  );
}

export default App;
