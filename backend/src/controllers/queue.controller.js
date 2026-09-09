const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/response");
const { generateQueueNumber } = require("../utils/generateCode");

const BASE_SELECT = `
  SELECT q.*, p.name AS patient_name, po.name AS poli_name, r.status AS registration_status
  FROM queues q
  JOIN registrations r ON r.id = q.registration_id
  JOIN patients p ON p.id = r.patient_id
  JOIN polis po ON po.id = q.poli_id
`;

// GET /queues?date=&poli_id=&status=
const getQueues = asyncHandler(async (req, res) => {
  const conditions = ["q.queue_date = COALESCE($1, CURRENT_DATE)"];
  const params = [req.query.date || null];

  if (req.query.poli_id) {
    params.push(req.query.poli_id);
    conditions.push(`q.poli_id = $${params.length}`);
  }
  if (req.query.status) {
    params.push(req.query.status);
    conditions.push(`q.status = $${params.length}`);
  }

  const result = await pool.query(
    `${BASE_SELECT} WHERE ${conditions.join(" AND ")} ORDER BY q.id ASC`,
    params,
  );

  return success(res, result.rows);
});

// POST /queues
// Manually create a queue entry for an existing registration
// (normally a queue is auto-created together with the registration).
const createQueue = asyncHandler(async (req, res) => {
  const { registration_id, poli_id } = req.body;

  const registration = await pool.query(
    "SELECT id FROM registrations WHERE id = $1",
    [registration_id],
  );
  if (registration.rows.length === 0)
    return error(res, "Data pendaftaran tidak ditemukan", {}, 404);

  const queueNumber = await generateQueueNumber(poli_id);
  const result = await pool.query(
    `INSERT INTO queues (registration_id, poli_id, queue_number) VALUES ($1, $2, $3) RETURNING *`,
    [registration_id, poli_id, queueNumber],
  );

  return success(res, result.rows[0], "Antrean berhasil dibuat", 201);
});

// PUT /queues/:id/call
// Marks a queue as "Dipanggil" (called) and syncs registration status
const callQueue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const queue = await pool.query("SELECT * FROM queues WHERE id = $1", [id]);
  if (queue.rows.length === 0)
    return error(res, "Antrean tidak ditemukan", {}, 404);

  const result = await pool.query(
    `UPDATE queues SET status = 'Dipanggil', called_at = NOW() WHERE id = $1 RETURNING *`,
    [id],
  );

  await pool.query(
    `UPDATE registrations SET status = 'Check In', updated_at = NOW() WHERE id = $1`,
    [queue.rows[0].registration_id],
  );

  return success(res, result.rows[0], "Antrean berhasil dipanggil");
});

// PUT /queues/:id/status
const updateQueueStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["Menunggu", "Dipanggil", "Selesai", "Batal"];
  if (!validStatuses.includes(status)) {
    return error(
      res,
      "Validation Error",
      { status: "Status tidak valid" },
      422,
    );
  }

  const result = await pool.query(
    `UPDATE queues SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id],
  );
  if (result.rows.length === 0)
    return error(res, "Antrean tidak ditemukan", {}, 404);

  return success(res, result.rows[0], "Status antrean berhasil diperbarui");
});

module.exports = { getQueues, createQueue, callQueue, updateQueueStatus };
