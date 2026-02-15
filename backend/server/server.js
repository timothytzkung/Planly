// Serves as entry point
const express = require('express');
const cors = require('cors'); // Import the CORS package
const app = express();
const PORT = 5050;
const FRONT_PORT = 5173;

// Middleware to parse JSON 
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: `http://localhost:${FRONT_PORT}`
}));

// Hello API route
app.get('/api/hello', (req, res) => {
  res.json({ message: "Hello from the Node backend!" });
});

// Listen
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});