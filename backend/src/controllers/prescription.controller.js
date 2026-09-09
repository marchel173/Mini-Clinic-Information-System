const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/response");

// POST /prescriptions
// Adds a single prescription to an existing medical record
// (bulk creation also happens inline via POST /medical-records).
const createPrescription = asyncHandler(async (req, res) => {
  const { medical_record_id, medicine_name, dosage, quantity, instructions } =
    req.body;

  const record = await pool.query(
    "SELECT id FROM medical_records WHERE id = $1",
    [medical_record_id],
  );
  if (record.rows.length === 0)
    return error(res, "Rekam medis tidak ditemukan", {}, 404);

  const result = await pool.query(
    `INSERT INTO prescriptions (medical_record_id, medicine_name, dosage, quantity, instructions)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [
      medical_record_id,
      medicine_name,
      dosage || null,
      quantity || null,
      instructions || null,
    ],
  );

  return success(res, result.rows[0], "Resep berhasil ditambahkan", 201);
});

// GET /prescriptions/:id
// :id here refers to a medical_record_id — returns all prescriptions
// belonging to that medical record.
const getPrescriptionsByRecord = asyncHandler(async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM prescriptions WHERE medical_record_id = $1 ORDER BY id ASC",
    [req.params.id],
  );
  return success(res, result.rows);
});

module.exports = { createPrescription, getPrescriptionsByRecord };
