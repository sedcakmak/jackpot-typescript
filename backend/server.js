import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import "dotenv/config";
import { v4 as uuidv4 } from "uuid";
import walletRouter from "./routes/wallet.js";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.use("/api", walletRouter);

//Get Balance of an Existing Wallet

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

// Newly Created Wallet Info

app.get("/api/wallet-info", async (req, res) => {
  const { authorization } = req.headers;
  console.log("Received Authorization header:", authorization);

  const userToken = authorization?.split(" ")[1];
  console.log("Extracted user token:", userToken);

  if (!userToken) {
    return res.status(400).json({ error: "User token is missing" });
  }

  const walletUrl = "https://api.circle.com/v1/w3s/wallets";

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
  };

  try {
    const walletResponse = await fetch(walletUrl, options);
    const walletData = await walletResponse.json();

    if (
      walletData.data &&
      walletData.data.wallets &&
      walletData.data.wallets.length > 0
    ) {
      const latestWallet = walletData.data.wallets[0];
      res.json({
        id: latestWallet.id,
        state: latestWallet.state,
        address: latestWallet.address,
        blockchain: latestWallet.blockchain,
        createDate: latestWallet.createDate,
      });
    } else {
      res.status(404).json({ error: "No wallet found" });
    }
  } catch (error) {
    console.error("Error fetching wallet info:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle deposit transactions not sure if this is what we want. this isnt working currently

// app.post("/api/transfer-usdc", async (req, res) => {
//   const { userToken, destinationAddress, amount, walletId } = req.body;

//   if (!userToken || !destinationAddress || !amount || !walletId) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   const idempotencyKey = uuidv4();

//   const transferUrl =
//     "https://api.circle.com/v1/w3s/user/transactions/transfer";

//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.API_KEY}`,
//       "X-User-Token": userToken,
//     },
//     body: JSON.stringify({
//       idempotencyKey: idempotencyKey,
//       userId: `${process.env.USER_ID}`,
//       destinationAddress: destinationAddress,
//       amounts: [amount],
//       feeLevel: "HIGH",
//       tokenId: `${process.env.USDC_TOKEN_ID}`,
//       walletId: walletId,
//     }),
//   };

//   try {
//     const response = await fetch(transferUrl, options);
//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.error || "Error during transaction");
//     }

//     res.json(data);
//   } catch (error) {
//     console.error("Error processing transaction:", error);
//     res.status(500).json({ error: error.message });
//   }
// });
