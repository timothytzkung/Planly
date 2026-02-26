import React, { useEffect, useState } from "react";

import { PdfUploadPage } from "./test/PdfUploadPage";

function App() {
  const [message, setMessage] = useState("");
  const [pdfFile, setPdfFile] = useState("");

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
  }, [pdfFile]);

  return (
    <div className="App">
      <h1>Planly</h1>
      <p>Server says: {message}</p>
      <PdfUploadPage />
    </div>
  );
}

export default App;
