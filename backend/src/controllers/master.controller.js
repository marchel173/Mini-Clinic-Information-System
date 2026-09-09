const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

// GET /polis
const getPolis = asyncHandler(async (req, res) => {
  const result = await pool.query("SELECT * FROM polis ORDER BY id ASC");
  return success(res, result.rows);
});

// GET /doctors
const getDoctors = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT d.*, po.name AS poli_name FROM doctors d
     LEFT JOIN polis po ON po.id = d.poli_id
     WHERE d.is_active = TRUE ORDER BY d.name ASC`,
  );
  return success(res, result.rows);
});

module.exports = { getPolis, getDoctors };
