// import express from "express";
// import fetch from "node-fetch";
// import cors from "cors"; // Import CORS middleware
// import "dotenv/config";

// const app = express();
// const port = 3001; // Change this port if necessary

// // Use CORS middleware
// app.use(cors());

// // app.get("/api/check-balance/:ucwId", async (req, res) => {
// //   const { ucwId } = req.params;
// //   const balanceUrl = `https://api.circle.com/v1/w3s/wallets/${ucwId}/balances`;
// //   const walletDetailsUrl = `https://api.circle.com/v1/w3s/wallets/${ucwId}`;

// //   const options = {
// //     method: "GET",
// //     headers: {
// //       "Content-Type": "application/json",
// //       Authorization: `Bearer ${process.env.API_KEY}`,
// //     },
// //   };

// //   try {
// //     const balanceResponse = await fetch(balanceUrl, options);
// //     const balanceData = await balanceResponse.json();
// //     const detailsResponse = await fetch(walletDetailsUrl, options);
// //     const detailsData = await detailsResponse.json();

// //     console.log("Backend response data:", balanceData); // Add this log for debugging
// //     const result = {
// //       balance: balanceData,
// //       walletDetails: detailsData,
// //     };
// //     res.json(result);
// //   } catch (error) {
// //     console.error("Error fetching wallet data:", error);
// //     res.status(500).json({ error: error.message });
// //   }
// // });

//   try {
//     // Fetch wallet details first
//     const detailsResponse = await fetch(walletDetailsUrl, options);
//     const detailsData = await detailsResponse.json();

//     // Check wallet status
//     if (detailsData.data.status !== "ACTIVE") {
//       return res.status(400).json({
//         error: `Wallet is not active. Status: ${detailsData.data.status}`,
//       });
//     }

//     // If active, fetch balance
//     const balanceResponse = await fetch(balanceUrl, options);
//     const balanceData = await balanceResponse.json();

//     // Combine the data
//     const result = {
//       walletDetails: detailsData.data,
//       balance: balanceData.data,
//     };

//     res.json(result);
//   } catch (error) {
//     console.error("Error fetching wallet data:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import "dotenv/config";
import walletRouter from "./routes/wallet.js";

const app = express();
const port = 3001;

console.log("Server starting...");

app.use(cors());
app.use(express.json());

app.use("/api", walletRouter);
console.log("Wallet router attached");
console.log("API_KEY:", process.env.API_KEY);
console.log("APP_ID:", process.env.APP_ID);

app.get("/test", (req, res) => {
  res.json({ message: "Test route working" });
});

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
    // Fetch balance data
    const balanceResponse = await fetch(balanceUrl, options);
    const balanceData = await balanceResponse.json();

    // Send balance data as response
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
