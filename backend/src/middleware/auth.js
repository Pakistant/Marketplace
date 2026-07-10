const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Token JWT requis." });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token JWT invalide ou expire." });
  }
}

module.exports = { requireAuth };

