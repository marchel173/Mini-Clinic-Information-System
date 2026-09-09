const router = require("express").Router();
const {
  createMedicalRecord,
  getMedicalRecordsByPatient,
} = require("../controllers/medicalRecord.controller");
const { medicalRecordRules } = require("../validators/medicalRecord.validator");
const validate = require("../middlewares/validate.middleware");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.post(
  "/",
  authorize("dokter"),
  medicalRecordRules,
  validate,
  createMedicalRecord,
);
router.get("/:patientId", getMedicalRecordsByPatient);

module.exports = router;
