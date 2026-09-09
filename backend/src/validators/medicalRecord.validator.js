const { body } = require("express-validator");

const medicalRecordRules = [
  body("registration_id").isInt().withMessage("Data pendaftaran wajib diisi"),
  body("complaint").optional({ checkFalsy: true }).trim(),
  body("blood_pressure").optional({ checkFalsy: true }).trim(),
  body("temperature")
    .optional({ checkFalsy: true })
    .isFloat({ min: 30, max: 45 })
    .withMessage("Suhu tubuh tidak valid"),
  body("weight")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Berat badan tidak valid"),
  body("height")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Tinggi badan tidak valid"),
  body("diagnosis").optional({ checkFalsy: true }).trim(),
  body("therapy_plan").optional({ checkFalsy: true }).trim(),
  body("actions")
    .optional()
    .isArray()
    .withMessage("Tindakan medis harus berupa array"),
  body("prescriptions")
    .optional()
    .isArray()
    .withMessage("Resep obat harus berupa array"),
];

module.exports = { medicalRecordRules };
