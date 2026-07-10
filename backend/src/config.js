const path = require("path");
require("dotenv").config();

const defaultCorsOrigins = [
  "http://localhost:3000",
  "http://localhost:4200",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4200",
  "http://127.0.0.1:5173",
];

function parseCorsOrigins(value) {
  if (!value || value === "*") {
    return ["*"];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

module.exports = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  databaseFile: process.env.DATABASE_FILE || path.join(__dirname, "..", "marketdouala.sqlite"),
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN || defaultCorsOrigins.join(",")),
};

