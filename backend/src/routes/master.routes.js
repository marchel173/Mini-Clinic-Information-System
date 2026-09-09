const router = require("express").Router();
const { getPolis, getDoctors } = require("../controllers/master.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/polis", getPolis);
router.get("/doctors", getDoctors);

module.exports = router;
