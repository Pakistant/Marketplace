const cors = require("cors");
const express = require("express");
const { corsOrigins } = require("./config");
const { initDb } = require("./db/init");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes("*") || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "marketdouala-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res) => res.status(404).json({ message: "Route introuvable." }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Erreur serveur." });
});

module.exports = { app, initDb };

