const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const USERS = [{ username: "Admin", password: "mypassword" }];

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const validUser = USERS.find(user => user.username === username && user.password === password);
  if (validUser) {
    return res.json({ success: true, token: "mock-jwt-token" });
  } else {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

app.get("/api/prices", async (req, res) => {
  try {
    const result = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd");
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch crypto prices" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
