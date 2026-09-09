const router = require("express").Router();

router.use("/", require("./auth.routes")); // /login, /logout, /me
router.use("/patients", require("./patient.routes"));
router.use("/registrations", require("./registration.routes"));
router.use("/queues", require("./queue.routes"));
router.use("/medical-records", require("./medicalRecord.routes"));
router.use("/prescriptions", require("./prescription.routes"));
router.use("/master", require("./master.routes")); // /master/polis, /master/doctors
router.use("/dashboard", require("./dashboard.routes"));

module.exports = router;
