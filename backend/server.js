import express from "express";
import cors from "cors";
import walletRouter from "./routes/wallet.js";

const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = ["http://localhost:3000", process.env.FRONTEND_URL];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

app.use("/api", walletRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
