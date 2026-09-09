const { validationResult } = require("express-validator");
const { error } = require("../utils/response");

// Runs after express-validator chains; short-circuits with a 422 if any
// validation rule failed.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = {};
    errors.array().forEach((e) => {
      formatted[e.path] = e.msg;
    });
    return error(res, "Validation Error", formatted, 422);
  }
  next();
}

module.exports = validate;
