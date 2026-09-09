const { body } = require("express-validator");

const patientRules = [
  body("nik")
    .trim()
    .notEmpty()
    .withMessage("NIK wajib diisi")
    .isLength({ min: 16, max: 16 })
    .withMessage("NIK harus 16 digit")
    .isNumeric()
    .withMessage("NIK hanya boleh berisi angka"),
  body("name").trim().notEmpty().withMessage("Nama pasien wajib diisi"),
  body("gender").isIn(["L", "P"]).withMessage("Jenis kelamin harus L atau P"),
  body("birth_date").isDate().withMessage("Tanggal lahir tidak valid"),
  body("phone")
    .optional({ checkFalsy: true })
    .matches(/^(\+62|62|0)8[1-9][0-9]{6,10}$/)
    .withMessage("Nomor telepon tidak valid (gunakan format 08xx atau +62xx)"),
  body("address").optional({ checkFalsy: true }).trim(),
];

module.exports = { patientRules };
