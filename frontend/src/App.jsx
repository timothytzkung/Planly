import React, { useEffect, useState } from "react";

import { PdfUploadPage } from "./views/test/PdfUploadPage";
import { SFUCoursesPage } from "./views/test/SFUCoursesPage";

import { PrimaryButton } from "./components/PrimaryButton";
import { SecondaryButton } from "./components/SecondaryButton";


import { LandingView } from "./views/LandingView";

function App() {
  const [message, setMessage] = useState("");
  const [pdfFile, setPdfFile] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  },[])

  const BACK_PORT = 5050;

  const getHello = async () => {
    await fetch(`http://localhost:${BACK_PORT}/api/hello`)
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error fetching data:", error));
  };

  useEffect(() => {
    // Note: We use the FULL URL. There is no proxy to infer the host.
    getHello();
  });

  return (
    <div className="App">
      <LandingView mounted={mounted}/>

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
