const { body } = require("express-validator");

const registrationRules = [
  body("patient_id").isInt().withMessage("Pasien wajib dipilih"),
  body("poli_id").isInt().withMessage("Poli wajib dipilih"),
  body("doctor_id")
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage("Dokter tidak valid"),
  body("visit_date")
    .optional({ checkFalsy: true })
    .isDate()
    .withMessage("Tanggal kunjungan tidak valid"),
  body("payment_type")
    .isIn(["Umum", "BPJS", "Asuransi"])
    .withMessage("Jenis pembayaran tidak valid"),
  body("initial_complaint").optional({ checkFalsy: true }).trim(),
];

const statusRules = [
  body("status")
    .isIn(["Menunggu", "Check In", "Pemeriksaan", "Selesai"])
    .withMessage("Status tidak valid"),
];

module.exports = { registrationRules, statusRules };
