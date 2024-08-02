import express from "express";
import cors from "cors";
import walletRouter from "./routes/wallet.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Use the wallet router for all wallet-related routes
app.use("/api", walletRouter);

app.listen(port, () => {
  function print(path, layer) {
    if (layer.route) {
      layer.route.stack.forEach(
        print.bind(null, path.concat(split(layer.route.path)))
      );
    } else if (layer.name === "router" && layer.handle.stack) {
      layer.handle.stack.forEach(
        print.bind(null, path.concat(split(layer.regexp)))
      );
    } else if (layer.method) {
      console.log(
        "%s /%s",
        layer.method.toUpperCase(),
        path.concat(split(layer.regexp)).filter(Boolean).join("/")
      );
    }
  }

  function split(thing) {
    if (typeof thing === "string") return thing.split("/");
    else if (thing.fast_slash) return "";
    else
      return thing
        .toString()
        .replace("\\/?", "")
        .replace("(?=\\/|$)", "$")
        .split("/");
  }

  app._router.stack.forEach(print.bind(null, []));
});
