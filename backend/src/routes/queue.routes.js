const router = require("express").Router();
const {
  getQueues,
  createQueue,
  callQueue,
  updateQueueStatus,
} = require("../controllers/queue.controller");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/", getQueues);
router.post(
  "/",
  authorize("administrator", "petugas_pendaftaran"),
  createQueue,
);
router.put(
  "/:id/call",
  authorize("administrator", "petugas_pendaftaran", "dokter"),
  callQueue,
);
router.put(
  "/:id/status",
  authorize("administrator", "petugas_pendaftaran", "dokter"),
  updateQueueStatus,
);

module.exports = router;
