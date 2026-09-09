const jwt = require("jsonwebtoken");
const { error } = require("../utils/response");

// Verifies the Bearer JWT and attaches the decoded payload to req.user
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return error(res, "Token tidak ditemukan", {}, 401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return error(res, "Token tidak valid atau sudah kedaluwarsa", {}, 401);
    }
    req.user = decoded; // { id, username, role, name }
    next();
  });
}

// Role-based authorization. Usage: authorize('administrator', 'dokter')
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return error(res, "Anda tidak memiliki akses untuk aksi ini", {}, 403);
    }
    next();
  };
}

module.exports = { verifyToken, authorize };
