const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/response");
const { generateMedicalRecordNo } = require("../utils/generateCode");

// GET /patients?search=&page=&limit=
const getPatients = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search ? `%${req.query.search}%` : null;

  const whereClause = search
    ? `WHERE name ILIKE $1 OR nik ILIKE $1 OR medical_record_no ILIKE $1`
    : "";
  const params = search ? [search] : [];

  const dataQuery = `
    SELECT * FROM patients
    ${whereClause}
    ORDER BY id DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  const countQuery = `SELECT COUNT(*)::int AS total FROM patients ${whereClause}`;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [...params, limit, offset]),
    pool.query(countQuery, params),
  ]);

  const total = countResult.rows[0].total;

  return success(res, {
    items: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /patients/:id
const getPatientById = asyncHandler(async (req, res) => {
  const result = await pool.query("SELECT * FROM patients WHERE id = $1", [
    req.params.id,
  ]);
  if (result.rows.length === 0)
    return error(res, "Pasien tidak ditemukan", {}, 404);
  return success(res, result.rows[0]);
});

// POST /patients
const createPatient = asyncHandler(async (req, res) => {
  const { nik, name, gender, birth_date, phone, address } = req.body;

  const existing = await pool.query("SELECT id FROM patients WHERE nik = $1", [
    nik,
  ]);
  if (existing.rows.length > 0) {
    return error(res, "Validation Error", { nik: "NIK sudah terdaftar" }, 422);
  }

  const medicalRecordNo = await generateMedicalRecordNo();

  const result = await pool.query(
    `INSERT INTO patients (medical_record_no, nik, name, gender, birth_date, phone, address)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      medicalRecordNo,
      nik,
      name,
      gender,
      birth_date,
      phone || null,
      address || null,
    ],
  );

  return success(res, result.rows[0], "Pasien berhasil ditambahkan", 201);
});

// PUT /patients/:id
const updatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nik, name, gender, birth_date, phone, address } = req.body;

  const patient = await pool.query("SELECT id FROM patients WHERE id = $1", [
    id,
  ]);
  if (patient.rows.length === 0)
    return error(res, "Pasien tidak ditemukan", {}, 404);

  const dup = await pool.query(
    "SELECT id FROM patients WHERE nik = $1 AND id != $2",
    [nik, id],
  );
  if (dup.rows.length > 0) {
    return error(
      res,
      "Validation Error",
      { nik: "NIK sudah digunakan pasien lain" },
      422,
    );
  }

  const result = await pool.query(
    `UPDATE patients SET nik=$1, name=$2, gender=$3, birth_date=$4, phone=$5, address=$6, updated_at=NOW()
     WHERE id=$7 RETURNING *`,
    [nik, name, gender, birth_date, phone || null, address || null, id],
  );

  return success(res, result.rows[0], "Pasien berhasil diperbarui");
});

// DELETE /patients/:id
const deletePatient = asyncHandler(async (req, res) => {
  const result = await pool.query(
    "DELETE FROM patients WHERE id = $1 RETURNING id",
    [req.params.id],
  );
  if (result.rows.length === 0)
    return error(res, "Pasien tidak ditemukan", {}, 404);
  return success(res, {}, "Pasien berhasil dihapus");
});

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};
