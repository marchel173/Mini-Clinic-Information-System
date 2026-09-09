const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/response");

// POST /medical-records
// Creates a SOAP medical record together with its medical actions and
// prescriptions in one transaction, then marks the registration "Selesai".
const createMedicalRecord = asyncHandler(async (req, res) => {
  const {
    registration_id,
    complaint,
    blood_pressure,
    temperature,
    weight,
    height,
    diagnosis,
    therapy_plan,
    actions = [],
    prescriptions = [],
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const regResult = await client.query(
      "SELECT * FROM registrations WHERE id = $1",
      [registration_id],
    );
    if (regResult.rows.length === 0) {
      throw Object.assign(new Error("Data pendaftaran tidak ditemukan"), {
        statusCode: 404,
      });
    }
    const registration = regResult.rows[0];

    const recordResult = await client.query(
      `INSERT INTO medical_records
        (registration_id, patient_id, doctor_id, complaint, blood_pressure, temperature, weight, height, diagnosis, therapy_plan)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        registration_id,
        registration.patient_id,
        registration.doctor_id,
        complaint || null,
        blood_pressure || null,
        temperature || null,
        weight || null,
        height || null,
        diagnosis || null,
        therapy_plan || null,
      ],
    );
    const record = recordResult.rows[0];

    const insertedActions = [];
    for (const action of actions) {
      const r = await client.query(
        `INSERT INTO medical_actions (medical_record_id, action_name, notes) VALUES ($1,$2,$3) RETURNING *`,
        [record.id, action.action_name, action.notes || null],
      );
      insertedActions.push(r.rows[0]);
    }

    const insertedPrescriptions = [];
    for (const p of prescriptions) {
      const r = await client.query(
        `INSERT INTO prescriptions (medical_record_id, medicine_name, dosage, quantity, instructions)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [
          record.id,
          p.medicine_name,
          p.dosage || null,
          p.quantity || null,
          p.instructions || null,
        ],
      );
      insertedPrescriptions.push(r.rows[0]);
    }

    await client.query(
      `UPDATE registrations SET status = 'Selesai', updated_at = NOW() WHERE id = $1`,
      [registration_id],
    );
    await client.query(
      `UPDATE queues SET status = 'Selesai' WHERE registration_id = $1`,
      [registration_id],
    );

    await client.query("COMMIT");

    return success(
      res,
      {
        ...record,
        actions: insertedActions,
        prescriptions: insertedPrescriptions,
      },
      "Rekam medis berhasil disimpan",
      201,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

// GET /medical-records/:patientId
// Returns the full examination history for a patient.
const getMedicalRecordsByPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const records = await pool.query(
    `SELECT mr.*, d.name AS doctor_name
     FROM medical_records mr
     LEFT JOIN doctors d ON d.id = mr.doctor_id
     WHERE mr.patient_id = $1
     ORDER BY mr.created_at DESC`,
    [patientId],
  );

  const recordIds = records.rows.map((r) => r.id);
  let actionsByRecord = {};
  let prescriptionsByRecord = {};

  if (recordIds.length > 0) {
    const actions = await pool.query(
      `SELECT * FROM medical_actions WHERE medical_record_id = ANY($1::int[])`,
      [recordIds],
    );
    const prescriptions = await pool.query(
      `SELECT * FROM prescriptions WHERE medical_record_id = ANY($1::int[])`,
      [recordIds],
    );

    actionsByRecord = groupBy(actions.rows, "medical_record_id");
    prescriptionsByRecord = groupBy(prescriptions.rows, "medical_record_id");
  }

  const data = records.rows.map((r) => ({
    ...r,
    actions: actionsByRecord[r.id] || [],
    prescriptions: prescriptionsByRecord[r.id] || [],
  }));

  return success(res, data);
});

function groupBy(rows, key) {
  return rows.reduce((acc, row) => {
    (acc[row[key]] = acc[row[key]] || []).push(row);
    return acc;
  }, {});
}

module.exports = { createMedicalRecord, getMedicalRecordsByPatient };
