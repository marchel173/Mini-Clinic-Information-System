const router = require("express").Router();
const { login, logout, me } = require("../controllers/auth.controller");
const { loginRules } = require("../validators/auth.validator");
const validate = require("../middlewares/validate.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/login", loginRules, validate, login);
router.post("/logout", verifyToken, logout);
router.get("/me", verifyToken, me);

module.exports = router;
