const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = async function(req, res, next) {
  // Get Token From The Header
  const token = req.header("x-auth-token");

  // Send Response If Token Is Not Available
  if (!token) return res.status(401).json({ msg: "Not Authorized" });

  try {
    // Verify Token & Decode it
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    // Adding Decoded Payload to Request
    req.user = decoded.user;

    // Calling Next Middleware
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid Token" });
  }
};
