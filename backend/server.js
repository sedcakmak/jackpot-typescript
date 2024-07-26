import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import "dotenv/config";
import walletRouter from "./routes/wallet.js";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.use("/api", walletRouter);

app.get("/api/check-balance/:ucwId", async (req, res) => {
  const { ucwId } = req.params;
  const balanceUrl = `https://api.circle.com/v1/w3s/wallets/${ucwId}/balances`;

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
  };

  try {
    const balanceResponse = await fetch(balanceUrl, options);
    const balanceData = await balanceResponse.json();

    const result = {
      balance: balanceData.data,
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
