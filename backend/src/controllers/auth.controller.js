const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/response");

// POST /login
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const result = await pool.query(
    "SELECT id, username, password, name, role, is_active FROM users WHERE username = $1",
    [username],
  );

  if (result.rows.length === 0) {
    return error(res, "Username atau password salah", {}, 401);
  }

  const user = result.rows[0];

  if (!user.is_active) {
    return error(res, "Akun tidak aktif, hubungi administrator", {}, 403);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return error(res, "Username atau password salah", {}, 401);
  }

  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  });

  return success(res, { token, user: payload }, "Login berhasil");
});

// POST /logout
// Stateless JWT: the client discards the token. This endpoint exists mainly
// for API-contract completeness / future token-blacklisting.
const logout = asyncHandler(async (req, res) => {
  return success(res, {}, "Logout berhasil");
});

// GET /me
const me = asyncHandler(async (req, res) => {
  return success(res, req.user, "OK");
});

module.exports = { login, logout, me };
