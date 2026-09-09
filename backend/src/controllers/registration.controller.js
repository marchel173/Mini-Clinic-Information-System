const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/response");

const BASE_SELECT = `
  SELECT r.*, p.name AS patient_name, p.medical_record_no,
         d.name AS doctor_name, po.name AS poli_name
  FROM registrations r
  JOIN patients p ON p.id = r.patient_id
  LEFT JOIN doctors d ON d.id = r.doctor_id
  JOIN polis po ON po.id = r.poli_id
`;

// GET /registrations?date=&status=&page=&limit=
const getRegistrations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const conditions = [];
  const params = [];

  if (req.query.date) {
    params.push(req.query.date);
    conditions.push(`r.visit_date = $${params.length}`);
  }
  if (req.query.status) {
    params.push(req.query.status);
    conditions.push(`r.status = $${params.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const dataQuery = `${BASE_SELECT} ${whereClause} ORDER BY r.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const countQuery = `SELECT COUNT(*)::int AS total FROM registrations r ${whereClause}`;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [...params, limit, offset]),
    pool.query(countQuery, params),
  ]);

  const total = countResult.rows[0].total;

  return success(res, {
    items: dataResult.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// POST /registrations
// Creates a registration AND automatically generates its queue number,
// linking the two records together in a single transaction.
const createRegistration = asyncHandler(async (req, res) => {
  const {
    patient_id,
    doctor_id,
    poli_id,
    visit_date,
    payment_type,
    initial_complaint,
  } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const patient = await client.query(
      "SELECT id FROM patients WHERE id = $1",
      [patient_id],
    );
    if (patient.rows.length === 0)
      throw Object.assign(new Error("Pasien tidak ditemukan"), {
        statusCode: 404,
      });

    const poli = await client.query("SELECT id FROM polis WHERE id = $1", [
      poli_id,
    ]);
    if (poli.rows.length === 0)
      throw Object.assign(new Error("Poli tidak ditemukan"), {
        statusCode: 404,
      });

    const regResult = await client.query(
      `INSERT INTO registrations (patient_id, doctor_id, poli_id, visit_date, payment_type, initial_complaint, created_by)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5, $6, $7) RETURNING *`,
      [
        patient_id,
        doctor_id || null,
        poli_id,
        visit_date || null,
        payment_type,
        initial_complaint || null,
        req.user.id,
      ],
    );
    const registration = regResult.rows[0];

    // Generate today's queue number for this poli (re-query inside the
    // transaction to avoid race conditions between concurrent requests).
    const poliInfo = await client.query(
      "SELECT queue_prefix FROM polis WHERE id = $1",
      [poli_id],
    );
    const prefix = poliInfo.rows[0].queue_prefix;
    const lastQueue = await client.query(
      `SELECT queue_number FROM queues WHERE poli_id = $1 AND queue_date = CURRENT_DATE
       ORDER BY id DESC LIMIT 1 FOR UPDATE`,
      [poli_id],
    );
    let nextSeq = 1;
    if (lastQueue.rows.length > 0) {
      nextSeq =
        parseInt(lastQueue.rows[0].queue_number.slice(prefix.length), 10) + 1;
    }
    const queueNumber = `${prefix}${String(nextSeq).padStart(3, "0")}`;

    const queueResult = await client.query(
      `INSERT INTO queues (registration_id, poli_id, queue_number) VALUES ($1, $2, $3) RETURNING *`,
      [registration.id, poli_id, queueNumber],
    );

    await client.query("COMMIT");

    return success(
      res,
      { registration, queue: queueResult.rows[0] },
      "Pendaftaran berhasil dibuat",
      201,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

// PUT /registrations/:id
const updateRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await pool.query(
    "SELECT id FROM registrations WHERE id = $1",
    [id],
  );
  if (existing.rows.length === 0)
    return error(res, "Data pendaftaran tidak ditemukan", {}, 404);

  const fields = [
    "doctor_id",
    "poli_id",
    "visit_date",
    "payment_type",
    "initial_complaint",
    "status",
  ];
  const updates = [];
  const params = [];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      params.push(req.body[field]);
      updates.push(`${field} = $${params.length}`);
    }
  });

  if (updates.length === 0)
    return error(res, "Tidak ada data untuk diperbarui", {}, 422);

  params.push(id);
  const result = await pool.query(
    `UPDATE registrations SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
    params,
  );

  return success(res, result.rows[0], "Pendaftaran berhasil diperbarui");
});

module.exports = { getRegistrations, createRegistration, updateRegistration };
