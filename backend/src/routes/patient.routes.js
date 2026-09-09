const router = require("express").Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} = require("../controllers/patient.controller");
const { patientRules } = require("../validators/patient.validator");
const validate = require("../middlewares/validate.middleware");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/", getPatients);
router.get("/:id", getPatientById);
router.post(
  "/",
  authorize("administrator", "petugas_pendaftaran"),
  patientRules,
  validate,
  createPatient,
);
router.put(
  "/:id",
  authorize("administrator", "petugas_pendaftaran"),
  patientRules,
  validate,
  updatePatient,
);
router.delete("/:id", authorize("administrator"), deletePatient);

module.exports = router;
