const pool = require("../config/db");

// Generates a Medical Record Number like RM-2026-000001
async function generateMedicalRecordNo() {
  const year = new Date().getFullYear();
  const result = await pool.query(
    `SELECT medical_record_no FROM patients
     WHERE medical_record_no LIKE $1
     ORDER BY id DESC LIMIT 1`,
    [`RM-${year}-%`],
  );

  let nextNumber = 1;
  if (result.rows.length > 0) {
    const last = result.rows[0].medical_record_no;
    const lastSeq = parseInt(last.split("-")[2], 10);
    nextNumber = lastSeq + 1;
  }
  return `RM-${year}-${String(nextNumber).padStart(6, "0")}`;
}

// Generates a daily queue number per poli, e.g. A001
async function generateQueueNumber(poliId) {
  const poliResult = await pool.query(
    "SELECT queue_prefix FROM polis WHERE id = $1",
    [poliId],
  );
  if (poliResult.rows.length === 0) throw new Error("Poli not found");
  const prefix = poliResult.rows[0].queue_prefix;

  const result = await pool.query(
    `SELECT queue_number FROM queues
     WHERE poli_id = $1 AND queue_date = CURRENT_DATE
     ORDER BY id DESC LIMIT 1`,
    [poliId],
  );

  let nextNumber = 1;
  if (result.rows.length > 0) {
    const lastSeq = parseInt(
      result.rows[0].queue_number.slice(prefix.length),
      10,
    );
    nextNumber = lastSeq + 1;
  }
  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

module.exports = { generateMedicalRecordNo, generateQueueNumber };
