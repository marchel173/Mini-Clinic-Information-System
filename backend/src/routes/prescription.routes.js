const router = require("express").Router();
const {
  createPrescription,
  getPrescriptionsByRecord,
} = require("../controllers/prescription.controller");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.post("/", authorize("dokter"), createPrescription);
router.get("/:id", getPrescriptionsByRecord);

module.exports = router;
