const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

// GET /dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const queries = {
    totalPatients: `SELECT COUNT(*)::int AS count FROM patients`,
    totalPatientsToday: `SELECT COUNT(*)::int AS count FROM registrations WHERE visit_date = CURRENT_DATE`,
    totalQueuesToday: `SELECT COUNT(*)::int AS count FROM queues WHERE queue_date = CURRENT_DATE`,
    totalWaiting: `SELECT COUNT(*)::int AS count FROM registrations WHERE visit_date = CURRENT_DATE AND status = 'Menunggu'`,
    totalDone: `SELECT COUNT(*)::int AS count FROM registrations WHERE visit_date = CURRENT_DATE AND status = 'Selesai'`,
  };

  const entries = Object.entries(queries);
  const results = await Promise.all(entries.map(([, q]) => pool.query(q)));

  const data = {};
  entries.forEach(([key], idx) => {
    data[key] = results[idx].rows[0].count;
  });

  return success(res, {
    total_pasien: data.totalPatients,
    total_pasien_hari_ini: data.totalPatientsToday,
    total_antrean_hari_ini: data.totalQueuesToday,
    total_pasien_menunggu: data.totalWaiting,
    total_pasien_selesai: data.totalDone,
  });
});

module.exports = { getDashboard };
