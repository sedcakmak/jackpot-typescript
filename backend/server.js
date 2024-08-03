import express from "express";
import cors from "cors";
import walletRouter from "./routes/wallet.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api", walletRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
