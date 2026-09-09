const router = require("express").Router();
const {
  getRegistrations,
  createRegistration,
  updateRegistration,
} = require("../controllers/registration.controller");
const { registrationRules } = require("../validators/registration.validator");
const validate = require("../middlewares/validate.middleware");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/", getRegistrations);
router.post(
  "/",
  authorize("administrator", "petugas_pendaftaran"),
  registrationRules,
  validate,
  createRegistration,
);
router.put(
  "/:id",
  authorize("administrator", "petugas_pendaftaran", "dokter"),
  updateRegistration,
);

module.exports = router;
